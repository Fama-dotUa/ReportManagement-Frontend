import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { IoCloseSharp } from 'react-icons/io5'
import './AvatarUploadModal.css'

type Props = {
	initialImage?: string
	onClose: () => void
	onApply: (file: File, previewUrl: string) => void
}

const AvatarUploadModal: React.FC<Props> = ({
	initialImage,
	onClose,
	onApply,
}) => {
	const [file, setFile] = useState<File | null>(null)
	const [preview, setPreview] = useState<string | null>(initialImage || null)

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selected = e.target.files?.[0]
		if (selected) {
			setFile(selected)
			setPreview(URL.createObjectURL(selected))
		}
	}

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		const dropped = e.dataTransfer.files?.[0]
		if (dropped) {
			setFile(dropped)
			setPreview(URL.createObjectURL(dropped))
		}
	}

	const preventDefault = (e: React.DragEvent) => e.preventDefault()

	return ReactDOM.createPortal(
		<div className='avatar-upload-modal__overlay'>
			<div className='avatar-upload-modal__content'>
				<button className='avatar-upload-modal__close' onClick={onClose}>
					<IoCloseSharp />
				</button>
				<h3 className='avatar-upload-modal__title'>Загрузка аватарки</h3>
				<div
					className='avatar-upload-modal__dropzone'
					onDrop={handleDrop}
					onDragOver={preventDefault}
				>
					{preview ? (
						<img
							src={preview}
							alt='preview'
							className='avatar-upload-modal__preview'
							loading='lazy'
						/>
					) : (
						<p>Перетащите файл сюда или выберите на компьютере</p>
					)}
					<input
						type='file'
						accept='image/*'
						onChange={handleFileChange}
						style={{ marginTop: '1rem', color: '#131313' }}
					/>
				</div>
				<div className='avatar-upload-modal__actions'>
					<button
						type='button'
						className='avatar-upload-modal__button avatar-upload-modal__button--cancel'
						onClick={onClose}
					>
						Отменить
					</button>
					<button
						type='button'
						className='avatar-upload-modal__button avatar-upload-modal__button--apply'
						disabled={!file}
						onClick={() => file && preview && onApply(file, preview)}
					>
						Применить
					</button>
				</div>
			</div>
		</div>,
		document.body
	)
}

export default AvatarUploadModal
