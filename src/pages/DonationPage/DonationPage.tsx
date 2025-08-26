import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { FaCopy } from 'react-icons/fa' // Иконка для кнопки
import { useUpdateUser } from '../../hooks/useUpdateUser'
import { checkPaymentByCode, type CheckPaymentResponse } from './paymentsClient';
import './DonationPage.css'

// ВАЖНО: Эта функция должна быть на бэкенде.
// Здесь она для демонстрации. Бэкенд должен сгенерировать,
// сохранить код для юзера и вернуть его.
//! ИДИ НА ХУЙ ГЕМИНИ
const generateAndSaveUserCode = async (user: any): Promise<string> => {
    // 1. Если у пользователя уже есть код, просто возвращаем его.
    if (user && user.unique_code) {
        return user.unique_code;
    }

	// Иначе генерируем новый (симуляция)
	const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Без похожих символов O/0, I/1
	let result = ''
	for (let i = 0; i < 6; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length))
	}
	// В реальном приложении здесь был бы API-запрос на сохранение этого кода
	console.log(`Generated code ${result} for user ${user?.id}. (This should be a backend call)`)
        try {
        // Получаем токен и URL API напрямую
        const token = localStorage.getItem('jwt');
        const API_URL = import.meta.env.VITE_API_URL; // Убедитесь, что VITE_API_URL доступен
        

        if (!token) {
            throw new Error('Токен авторизации не найден');
        }
        if (!user || !user.id) {
            throw new Error('ID пользователя не найден');
        }

        // Формируем тело запроса только с теми полями, которые нужно обновить
        const payload = {
            unique_code: result,
        };

        // Отправляем PUT-запрос для обновления пользователя
        const response = await fetch(`${API_URL}/api/users/${user.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            // Если сервер вернул ошибку, выводим ее
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Ошибка при сохранении кода на сервере');
        }

        console.log(`Сгенерирован и сохранен новый код ${result} для пользователя ${user.id}`);
        
        // 3. Возвращаем новый код только после успешного сохранения
        return result;

    } catch (error) {
        console.error('Не удалось сгенерировать и сохранить код:', error);
        // В случае ошибки возвращаем пустую строку или выбрасываем ошибку,
        // чтобы UI мог это обработать.
        throw error;
    }

	return result
}

type PaymentStatus = 'idle' | 'checking' | 'success' | 'duplicated' | 'notfound' | 'error';

const DonationPage: React.FC = () => {
	const navigate = useNavigate()
	const { user, refetchUser } = useAuth()

    const [donationCode, setDonationCode] = useState<string>('Загрузка...');
	const [isLoading, setIsLoading] = useState(true);

	// Ссылка на вашу банку Monobank
	const MONO_BANK_URL = 'https://send.monobank.ua/jar/2ZkTWpWwcu';
    const [status, setStatus] = useState<PaymentStatus>('idle');
    const [msg, setMsg] = useState<string>('');

	useEffect(() => {
		if (user) {
			// Создаем async функцию внутри useEffect для вызова await
			const setupCode = async () => {
				try {
					setIsLoading(true);
					// Вот здесь мы ЖДЕМ выполнения промиса
					const code = await generateAndSaveUserCode(user);
					// И только потом кладем РЕЗУЛЬТАТ (строку) в состояние
					setDonationCode(code);
				} catch (error) {
					setDonationCode('Ошибка');
				} finally {
					setIsLoading(false);
				}
			};
			setupCode();
		}
	}, [user]);

    // --- ОБНОВЛЕННАЯ ЛОГИКА ПРОВЕРКИ ---
    const handleCheckPayment = async () => {
        setStatus('checking'); 
        setMsg('');
        try {
          // Ваш API клиент, который обращается к бэкенду
          const res: CheckPaymentResponse & { created?: boolean; duplicated?: boolean } = await checkPaymentByCode(
            user?.unique_code ?? '',
            { timeoutMs: 12000 }
          );

          // --- ЛОГИКА ПРОВЕРКИ ПЕРЕПИСАНА НА SWITCH ---
          switch (true) {
            // res.created === true -> реально зачислили
            case res.created === true:
              setStatus('success');
              setMsg('Успешно! CR зачислены на ваш баланс.');
              if (refetchUser) refetchUser(); // Обновляем данные пользователя в UI
              break;
            
            // res.duplicated === true -> платёж уже был, ничего не делали
            case res.duplicate === true:
              setStatus('duplicated');
              setMsg('Эта оплата уже была зачислена ранее.');
              break;

            // Оплата найдена, но что-то пошло не так (например, не найден юзер)
            case (res.found === true && res.credited === false && res.duplicate === false):
              setStatus('error');
              setMsg(res.reason || 'Платёж найден, перезагрузите страницу или не удалось зачислить оплату.');
              break;
            
            // Оплата не найдена
            default:
              setStatus('notfound');
              setMsg(res.reason || 'Оплата пока не найдена. Попробуйте через минуту.');
              break;
          }
        } catch (e: any) {
          setStatus('error');
          setMsg(e?.message || 'Ошибка запроса');
        }
    };

    const handleCopyToClipboard = () => {
		// Теперь donationCode это всегда строка, и ошибки не будет
		if (donationCode && !isLoading && donationCode !== 'Ошибка') {
			navigator.clipboard.writeText(donationCode);
			alert(`Код ${donationCode} скопирован в буфер обмена!`);
		}
	};

    const renderStatusMessage = () => {
        if (!msg) return null;
        const statusClasses: Record<PaymentStatus, string> = {
            success: 'status-message success',
            duplicated: 'status-message info',
            notfound: 'status-message warning',
            error: 'status-message error',
            checking: 'status-message info',
            idle: ''
        };
        return <div className={statusClasses[status]}>{msg}</div>;
    };

	return (
		<div className='donation-page'>
			<div className='blur-background'></div>
			<div className='donation-panel'>
				<div className='donation-header'>
					<h1 className='animated-gradient-text'>Пополнение баланса</h1>
				</div>

				<div className='donation-content'>
					<p className='instructions'>
						Для пополнения баланса CR перейдите по ссылке на банку Monobank.
						<br />
						Курс обмена: <strong>1 грн = 10 CR</strong>.
					</p>

					<a href={MONO_BANK_URL} target='_blank' rel='noopener noreferrer' className='mono-link'>
						Перейти к банке Monobank
					</a>

					<p className='instructions important'>
						ВАЖНО! Чтобы CR были зачислены, обязательно укажите в комментарии
						к платежу ваш уникальный код:
					</p>

					<div className='donation-code-wrapper'>
						<span className='donation-code'>{donationCode}</span>
						<button className='copy-button' onClick={handleCopyToClipboard} title='Скопировать код'>
							<FaCopy />
						</button>
					</div>
                    <button className='check-payment-button' onClick={handleCheckPayment} disabled={status === 'checking'}>
                        {status==='checking' ? 'Проверяем…' : 'Проверить оплату'}
                    </button>
                    {renderStatusMessage()}
				</div>

				<button className='back-button' onClick={() => navigate('/officer')}>
					Назад
				</button>
			</div>
        </div>
	)
}

export default DonationPage
