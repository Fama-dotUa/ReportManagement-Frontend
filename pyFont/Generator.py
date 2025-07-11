#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Генератор шрифтов для pdfMake
Конвертирует шрифты в base64 и создает готовый TypeScript файл для React проекта
"""

import os
import sys
import base64
import json
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Set
from dataclasses import dataclass, asdict
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import logging
from datetime import datetime


@dataclass
class FontStyle:
    """Информация о стиле шрифта"""
    file_path: str
    base64_data: str
    file_size: int


@dataclass
class FontFamily:
    """Семейство шрифтов с различными стилями"""
    name: str
    normal: Optional[FontStyle] = None
    bold: Optional[FontStyle] = None
    italics: Optional[FontStyle] = None
    bolditalics: Optional[FontStyle] = None
    
    def has_styles(self) -> bool:
        """Проверяет, есть ли хотя бы один стиль"""
        return any([self.normal, self.bold, self.italics, self.bolditalics])
    
    def get_available_styles(self) -> List[str]:
        """Возвращает список доступных стилей"""
        styles = []
        if self.normal: styles.append('normal')
        if self.bold: styles.append('bold')
        if self.italics: styles.append('italics')
        if self.bolditalics: styles.append('bolditalics')
        return styles


class PdfMakeFontGenerator:
    """Генератор шрифтов для pdfMake"""
    
    def __init__(self):
        self.logger = self._setup_logger()
        self.font_families: Dict[str, FontFamily] = {}
        self.supported_extensions = {'.ttf', '.otf', '.woff', '.woff2'}
        self.max_file_size = 10 * 1024 * 1024  # 10MB максимум
    
    def _setup_logger(self) -> logging.Logger:
        """Настройка логирования"""
        logger = logging.getLogger('FontGenerator')
        logger.setLevel(logging.INFO)
        
        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)
        
        return logger
    
    def _detect_font_style(self, filename: str) -> str:
        """Определение стиля шрифта по имени файла"""
        name_lower = filename.lower()
        
        # Паттерны для определения стилей
        bold_patterns = ['bold', 'жирный', 'thick', 'heavy', 'black', 'extrabold', 'semibold']
        italic_patterns = ['italic', 'курсив', 'oblique', 'slanted', 'slant']
        
        is_bold = any(pattern in name_lower for pattern in bold_patterns)
        is_italic = any(pattern in name_lower for pattern in italic_patterns)
        
        if is_bold and is_italic:
            return 'bolditalics'
        elif is_bold:
            return 'bold'
        elif is_italic:
            return 'italics'
        else:
            return 'normal'
    
    def _extract_family_name(self, filename: str) -> str:
        """Извлечение имени семейства шрифта"""
        # Убираем расширение
        name = Path(filename).stem
        
        # Удаляем общие стилевые суффиксы
        style_patterns = [
            r'-Bold(?:Italic)?$', r'-Italic$', r'-Regular$', r'-Normal$',
            r'Bold(?:Italic)?$', r'Italic$', r'Regular$', r'Normal$',
            r'-Light$', r'-Medium$', r'-Thin$', r'-Black$',
            r'Light$', r'Medium$', r'Thin$', r'Black$',
            r'-Жирный$', r'-Курсив$', r'-Обычный$',
            r'Жирный$', r'Курсив$', r'Обычный$'
        ]
        
        for pattern in style_patterns:
            name = re.sub(pattern, '', name, flags=re.IGNORECASE)
        
        # Очищаем от лишних символов
        name = re.sub(r'[-_\s]+$', '', name)
        name = re.sub(r'^[-_\s]+', '', name)
        
        return name or Path(filename).stem
    
    def _file_to_base64(self, file_path: str) -> str:
        """Конвертация файла в base64"""
        try:
            with open(file_path, 'rb') as f:
                return base64.b64encode(f.read()).decode('utf-8')
        except Exception as e:
            self.logger.error(f"Ошибка чтения файла {file_path}: {e}")
            raise
    
    def add_font_file(self, file_path: str) -> bool:
        """Добавление файла шрифта"""
        try:
            path_obj = Path(file_path)
            
            # Проверки
            if not path_obj.exists():
                self.logger.error(f"Файл не найден: {file_path}")
                return False
            
            if path_obj.suffix.lower() not in self.supported_extensions:
                self.logger.warning(f"Неподдерживаемый формат: {path_obj.suffix}")
                return False
            
            file_size = path_obj.stat().st_size
            if file_size > self.max_file_size:
                self.logger.warning(f"Файл слишком большой ({file_size / 1024 / 1024:.1f}MB): {file_path}")
                return False
            
            # Определяем семейство и стиль
            family_name = self._extract_family_name(path_obj.name)
            style = self._detect_font_style(path_obj.name)
            
            # Конвертируем в base64
            base64_data = self._file_to_base64(file_path)
            
            # Создаем объект стиля
            font_style = FontStyle(
                file_path=file_path,
                base64_data=base64_data,
                file_size=file_size
            )
            
            # Добавляем в семейство
            if family_name not in self.font_families:
                self.font_families[family_name] = FontFamily(name=family_name)
            
            setattr(self.font_families[family_name], style, font_style)
            
            self.logger.info(f"Добавлен шрифт: {family_name} ({style}) - {file_size / 1024:.1f}KB")
            return True
            
        except Exception as e:
            self.logger.error(f"Ошибка добавления шрифта {file_path}: {e}")
            return False
    
    def add_fonts_from_directory(self, directory_path: str) -> int:
        """Добавление всех шрифтов из директории"""
        path_obj = Path(directory_path)
        
        if not path_obj.exists() or not path_obj.is_dir():
            self.logger.error(f"Директория не найдена: {directory_path}")
            return 0
        
        added_count = 0
        
        for file_path in path_obj.rglob('*'):
            if file_path.is_file() and file_path.suffix.lower() in self.supported_extensions:
                if self.add_font_file(str(file_path)):
                    added_count += 1
        
        self.logger.info(f"Добавлено {added_count} шрифтов из {directory_path}")
        return added_count
    
    def generate_typescript_file(self, output_path: str, module_name: str = "fontConfig") -> bool:
        """Генерация TypeScript файла с конфигурацией шрифтов"""
        try:
            # Фильтруем только семейства с хотя бы одним стилем
            valid_families = {name: family for name, family in self.font_families.items() 
                            if family.has_styles()}
            
            if not valid_families:
                self.logger.warning("Нет валидных семейств шрифтов для генерации")
                return False
            
            # Генерируем содержимое файла
            content = self._generate_typescript_content(valid_families, module_name)
            
            # Записываем файл
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            self.logger.info(f"TypeScript файл создан: {output_path}")
            return True
            
        except Exception as e:
            self.logger.error(f"Ошибка создания TypeScript файла: {e}")
            return False
    
    def _generate_typescript_content(self, families: Dict[str, FontFamily], module_name: str) -> str:
        """Генерация содержимого TypeScript файла"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        content = f"""// Автоматически сгенерированный файл шрифтов для pdfMake
// Создан: {timestamp}
// Семейств шрифтов: {len(families)}

import pdfMake from 'pdfmake/build/pdfmake'
import type {{ TFontDictionary }} from 'pdfmake/interfaces'

/**
 * VFS (Virtual File System) с данными шрифтов в base64
 */
const fontVfs: Record<string, string> = {{
"""
        
        # Генерируем VFS
        for family_name, family in families.items():
            for style in ['normal', 'bold', 'italics', 'bolditalics']:
                font_style = getattr(family, style)
                if font_style:
                    vfs_name = f"{family_name}-{style}.{Path(font_style.file_path).suffix[1:]}"
                    content += f"  '{vfs_name}': '{font_style.base64_data}',\n"
        
        content += "}\n\n"
        
        # Генерируем конфигурацию шрифтов
        content += """/**
 * Конфигурация шрифтов для pdfMake
 */
const fonts: TFontDictionary = {
"""
        
        for family_name, family in families.items():
            content += f"  '{family_name}': {{\n"
            
            for style in ['normal', 'bold', 'italics', 'bolditalics']:
                font_style = getattr(family, style)
                if font_style:
                    vfs_name = f"{family_name}-{style}.{Path(font_style.file_path).suffix[1:]}"
                    content += f"    {style}: '{vfs_name}',\n"
            
            content += "  },\n"
        
        content += "}\n\n"
        
        # Генерируем основные функции
        content += f"""/**
 * Применяет загруженные шрифты к pdfMake
 */
export const apply{module_name.capitalize()}Fonts = (): void => {{
  // Объединяем с существующими шрифтами
  const existingVfs = (pdfMake as any).vfs || {{}};
  (pdfMake as any).vfs = {{
    ...existingVfs,
    ...fontVfs
  }}
  
  // Настраиваем шрифты
  pdfMake.fonts = {{
    ...pdfMake.fonts,
    ...fonts
  }}
  
  console.log('🎨 Пользовательские шрифты применены:', {list(families.keys())})
}}

/**
 * Получает список доступных семейств шрифтов
 */
export const getAvailableFontFamilies = (): string[] => {{
  return {list(families.keys())}
}}

/**
 * Получает информацию о шрифтах
 */
export const getFontInfo = () => {{
  return {{
    families: {list(families.keys())},
    totalFonts: {sum(len(family.get_available_styles()) for family in families.values())},
    vfsSize: Object.keys(fontVfs).length
  }}
}}

/**
 * Проверяет, доступен ли шрифт
 */
export const isFontAvailable = (fontFamily: string): boolean => {{
  return fontFamily in fonts
}}

/**
 * Конфигурация шрифтов (экспорт для внешнего использования)
 */
export const {module_name} = {{
  fonts,
  vfs: fontVfs,
  apply: apply{module_name.capitalize()}Fonts,
  getAvailableFamilies: getAvailableFontFamilies,
  getInfo: getFontInfo,
  isAvailable: isFontAvailable
}}

// Автоматически применяем шрифты при импорте модуля
apply{module_name.capitalize()}Fonts()

export default {module_name}
"""
        
        return content
    
    def generate_usage_example(self, output_path: str) -> bool:
        """Генерация примера использования"""
        try:
            families = [name for name, family in self.font_families.items() if family.has_styles()]
            
            if not families:
                return False
            
            content = f"""// Пример использования пользовательских шрифтов в useReportPreview.tsx

import {{ useCallback }} from 'react'
import {{ useAuth }} from './useAuth'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import type {{ TDocumentDefinitions }} from 'pdfmake/interfaces'
import {{ marked }} from 'marked'

// Импортируем наши пользовательские шрифты
import fontConfig from '../utils/fontConfig' // Путь к сгенерированному файлу

// Применяем стандартные шрифты
;(pdfMake as any).vfs = (pdfFonts as any).vfs

// Наши шрифты уже применены автоматически при импорте fontConfig

export const useReportPreview = () => {{
    const {{ token }} = useAuth()
    
    const markdownToText = async (markdown: string) => {{
        const html = await marked.parseInline(markdown)
        const temp = document.createElement('div')
        temp.innerHTML = html
        return temp.innerText
    }}
    
    const previewReport = useCallback(async (reportId: string) => {{
        try {{
            const res = await fetch(
                `${{import.meta.env.VITE_API_URL}}/api/reports?filters[id][$eq]=${{reportId}}&populate=*`,
                {{
                    headers: {{
                        Authorization: `Bearer ${{token}}`,
                    }},
                }}
            )
            if (!res.ok) throw new Error('Ошибка при загрузке рапорта')

            const report = await res.json()
            const data = report.data[0]
            console.log('data:', data)

            // Проверяем доступные шрифты
            console.log('Доступные шрифты:', fontConfig.getAvailableFamilies())

            const docDefinition: TDocumentDefinitions = {{
                content: [
                    {{
                        text: 'Командующему Главного штаба STV_sqúad, генералу dyeness',
                        alignment: 'right',
                        margin: [0, 0, 0, 40],
                    }},
                    {{
                        text: `РАПОРТ №${{data.id}}`,
                        style: 'header',
                        alignment: 'center',
                        margin: [0, 0, 0, 30],
                    }},
                    {{
                        text: `В соответствии с п. 1.1 Закона STV_sqúad о дисциплинарных обязанностях`,
                        margin: [10, 0, 0, 0],
                        alignment: 'right',
                    }},
                    {{
                        text: `прошу вашего решения насчет ${{data.reason.cipher}}-${{data.reason.number}} ${{data.reason.description}} продолжительностью ${{data.duration}} || c ${{data.startDate}} по ${{data.endDate}}.`,
                        margin: [0, 0, 0, 20],
                        alignment: 'justify',
                    }},
                    {{
                        text: `Кому выдается: ${{data.targetRank}} ${{data.targetUsername}}`,
                        margin: [0, 0, 0, 10],
                    }},
                    {{
                        text: 'Обоснование:',
                        bold: true,
                        margin: [0, 10, 0, 5],
                    }},
                    {{
                        text: await markdownToText(data.description || ''),
                        margin: [0, 0, 0, 30],
                    }},
                    {{
                        text: `${{data.issuerRank || 'Звание'}}`,
                        alignment: 'left',
                        margin: [0, 10, 0, 0],
                    }},
                    {{
                        columns: [
                            {{ text: `${{data.issuerPosition || 'Должность'}}`, width: '50%' }},
                            {{
                                stack: [
                                    {{ text: `${{data.creator.username}}`, alignment: 'right' }},
                                ],
                                width: '50%',
                            }},
                        ],
                        columnGap: 10,
                        margin: [0, 10, 0, 0],
                    }},
                    {{
                        text: `${{data.startDate}}`,
                        alignment: 'left',
                        margin: [0, 10, 0, 0],
                    }},
                ],
                defaultStyle: {{
                    // Используем первый доступный пользовательский шрифт или Roboto как fallback
                    font: fontConfig.isAvailable('{families[0] if families else "Roboto"}') ? '{families[0] if families else "Roboto"}' : 'Roboto',
                    fontSize: 14,
                }},
                styles: {{
                    header: {{
                        fontSize: 18,
                        bold: true,
                        // Можно указать конкретный шрифт для заголовков
                        font: '{families[0] if families else "Roboto"}',
                    }},
                }},
            }}

            pdfMake.createPdf(docDefinition).open()
        }} catch (err) {{
            console.error(err)
            alert('Не удалось сформировать PDF')
        }}
    }}, [token])

    return {{ previewReport }}
}}

// Доступные шрифты в проекте:
// {chr(10).join(f"// - {name}" for name in families)}
"""
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            self.logger.info(f"Пример использования создан: {output_path}")
            return True
            
        except Exception as e:
            self.logger.error(f"Ошибка создания примера: {e}")
            return False
    
    def get_statistics(self) -> Dict:
        """Получение статистики загруженных шрифтов"""
        valid_families = {name: family for name, family in self.font_families.items() 
                         if family.has_styles()}
        
        total_files = sum(len(family.get_available_styles()) for family in valid_families.values())
        total_size = 0
        
        for family in valid_families.values():
            for style in ['normal', 'bold', 'italics', 'bolditalics']:
                font_style = getattr(family, style)
                if font_style:
                    total_size += font_style.file_size
        
        return {
            'families_count': len(valid_families),
            'total_files': total_files,
            'total_size_mb': round(total_size / 1024 / 1024, 2),
            'families': list(valid_families.keys())
        }


class FontGeneratorGUI:
    """GUI для генератора шрифтов"""
    
    def __init__(self):
        self.generator = PdfMakeFontGenerator()
        self.root = tk.Tk()
        self.setup_ui()
    
    def setup_ui(self):
        """Настройка интерфейса"""
        self.root.title("Генератор шрифтов для pdfMake")
        self.root.geometry("800x600")
        
        # Главный фрейм
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Кнопки выбора
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=0, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(0, 10))
        
        ttk.Button(
            button_frame,
            text="Выбрать файлы шрифтов",
            command=self.select_font_files
        ).grid(row=0, column=0, padx=(0, 5))
        
        ttk.Button(
            button_frame,
            text="Выбрать папку",
            command=self.select_font_directory
        ).grid(row=0, column=1, padx=5)
        
        ttk.Button(
            button_frame,
            text="Очистить все",
            command=self.clear_fonts
        ).grid(row=0, column=2, padx=5)
        
        # Список шрифтов
        ttk.Label(main_frame, text="Загруженные шрифты:").grid(
            row=1, column=0, columnspan=3, sticky=tk.W, pady=(10, 5)
        )
        
        # Treeview
        columns = ('family', 'styles', 'files', 'size')
        self.tree = ttk.Treeview(main_frame, columns=columns, show='headings', height=15)
        
        self.tree.heading('family', text='Семейство')
        self.tree.heading('styles', text='Стили')
        self.tree.heading('files', text='Файлов')
        self.tree.heading('size', text='Размер')
        
        self.tree.column('family', width=200)
        self.tree.column('styles', width=150)
        self.tree.column('files', width=80)
        self.tree.column('size', width=100)
        
        self.tree.grid(row=2, column=0, columnspan=3, sticky=(tk.W, tk.E, tk.N, tk.S), pady=5)
        
        # Scrollbar
        scrollbar = ttk.Scrollbar(main_frame, orient=tk.VERTICAL, command=self.tree.yview)
        scrollbar.grid(row=2, column=3, sticky=(tk.N, tk.S))
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        # Настройки генерации
        settings_frame = ttk.LabelFrame(main_frame, text="Настройки генерации", padding="5")
        settings_frame.grid(row=3, column=0, columnspan=4, sticky=(tk.W, tk.E), pady=(10, 0))
        
        ttk.Label(settings_frame, text="Имя модуля:").grid(row=0, column=0, sticky=tk.W)
        self.module_name_var = tk.StringVar(value="fontConfig")
        ttk.Entry(settings_frame, textvariable=self.module_name_var, width=20).grid(
            row=0, column=1, padx=(5, 20), sticky=tk.W
        )
        
        # Кнопки генерации
        generate_frame = ttk.Frame(settings_frame)
        generate_frame.grid(row=1, column=0, columnspan=2, pady=(10, 0))
        
        ttk.Button(
            generate_frame,
            text="Генерировать TypeScript",
            command=self.generate_typescript
        ).grid(row=0, column=0, padx=(0, 5))
        
        ttk.Button(
            generate_frame,
            text="Создать пример использования",
            command=self.generate_example
        ).grid(row=0, column=1, padx=5)
        
        # Статистика
        self.stats_label = ttk.Label(
            main_frame,
            text="Статистика: Нет загруженных шрифтов"
        )
        self.stats_label.grid(row=4, column=0, columnspan=4, pady=(10, 0))
        
        # Настройка растягивания
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(2, weight=1)
        main_frame.rowconfigure(2, weight=1)
    
    def select_font_files(self):
        """Выбор файлов шрифтов"""
        file_paths = filedialog.askopenfilenames(
            title="Выберите файлы шрифтов",
            filetypes=[
                ("Все шрифты", "*.ttf *.otf *.woff *.woff2"),
                ("TrueType", "*.ttf"),
                ("OpenType", "*.otf"),
                ("WOFF", "*.woff"),
                ("WOFF2", "*.woff2"),
                ("Все файлы", "*.*")
            ]
        )
        
        if file_paths:
            added_count = 0
            for file_path in file_paths:
                if self.generator.add_font_file(file_path):
                    added_count += 1
            
            self.update_font_list()
            messagebox.showinfo("Успех", f"Добавлено {added_count} из {len(file_paths)} файлов")
    
    def select_font_directory(self):
        """Выбор папки со шрифтами"""
        directory_path = filedialog.askdirectory(title="Выберите папку со шрифтами")
        
        if directory_path:
            added_count = self.generator.add_fonts_from_directory(directory_path)
            self.update_font_list()
            messagebox.showinfo("Успех", f"Добавлено {added_count} шрифтов из папки")
    
    def clear_fonts(self):
        """Очистка всех шрифтов"""
        if messagebox.askyesno("Подтверждение", "Очистить все загруженные шрифты?"):
            self.generator.font_families.clear()
            self.update_font_list()
    
    def update_font_list(self):
        """Обновление списка шрифтов"""
        # Очищаем список
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # Добавляем семейства
        for family_name, family in self.generator.font_families.items():
            if family.has_styles():
                styles = family.get_available_styles()
                file_count = len(styles)
                
                # Считаем общий размер
                total_size = 0
                for style in ['normal', 'bold', 'italics', 'bolditalics']:
                    font_style = getattr(family, style)
                    if font_style:
                        total_size += font_style.file_size
                
                size_str = f"{total_size / 1024:.1f} KB"
                
                self.tree.insert('', tk.END, values=(
                    family_name,
                    ', '.join(styles),
                    file_count,
                    size_str
                ))
        
        # Обновляем статистику
        stats = self.generator.get_statistics()
        self.stats_label.config(
            text=f"Семейств: {stats['families_count']}, "
                 f"Файлов: {stats['total_files']}, "
                 f"Размер: {stats['total_size_mb']} MB"
        )
    
    def generate_typescript(self):
        """Генерация TypeScript файла"""
        if not self.generator.font_families:
            messagebox.showwarning("Предупреждение", "Нет загруженных шрифтов")
            return
        
        file_path = filedialog.asksaveasfilename(
            title="Сохранить TypeScript файл",
            defaultextension=".ts",
            filetypes=[("TypeScript", "*.ts"), ("Все файлы", "*.*")]
        )
        
        if file_path:
            module_name = self.module_name_var.get() or "fontConfig"
            
            if self.generator.generate_typescript_file(file_path, module_name):
                messagebox.showinfo("Успех", f"TypeScript файл создан: {file_path}")
            else:
                messagebox.showerror("Ошибка", "Не удалось создать файл")
    
    def generate_example(self):
        """Генерация примера использования"""
        if not self.generator.font_families:
            messagebox.showwarning("Предупреждение", "Нет загруженных шрифтов")
            return
        
        file_path = filedialog.asksaveasfilename(
            title="Сохранить пример использования",
            defaultextension=".tsx",
            filetypes=[("TypeScript React", "*.tsx"), ("TypeScript", "*.ts"), ("Все файлы", "*.*")]
        )
        
        if file_path:
            if self.generator.generate_usage_example(file_path):
                messagebox.showinfo("Успех", f"Пример создан: {file_path}")
            else:
                messagebox.showerror("Ошибка", "Не удалось создать пример")
    
    def run(self):
        """Запуск GUI"""
        self.root.mainloop()


def main():
    """Основная функция"""
    if len(sys.argv) > 1:
        # Режим командной строки
        generator = PdfMakeFontGenerator()
        
        # Обработка аргументов
        output_file = None
        module_name = "fontConfig"
        
        fonts_to_process = []
        
        i = 0
        while i < len(sys.argv) - 1:
            i += 1
            arg = sys.argv[i]
            
            if arg == "--output" or arg == "-o":
                if i + 1 < len(sys.argv):
                    i += 1
                    output_file = sys.argv[i]
            elif arg == "--module" or arg == "-m":
                if i + 1 < len(sys.argv):
                    i += 1
                    module_name = sys.argv[i]
            elif arg == "--help" or arg == "-h":
                print("""
Использование: python font_generator.py [опции] [пути к файлам/папкам]

Опции:
  -o, --output FILE     Путь для сохранения TypeScript файла
  -m, --module NAME     Имя модуля (по умолчанию: fontConfig)
  -h, --help           Показать эту справку

Примеры:
  python font_generator.py font1.ttf font2.ttf --output fonts.ts
  python font_generator.py /path/to/fonts/ --module customFonts
                """)
                return
            else:
                fonts_to_process.append(arg)
        
        # Обработка шрифтов
        for path in fonts_to_process:
            path_obj = Path(path)
            
            if path_obj.is_file():
                generator.add_font_file(str(path_obj))
            elif path_obj.is_dir():
                generator.add_fonts_from_directory(str(path_obj))
            else:
                print(f"Путь не найден: {path}")
        
        # Генерация файла
        if generator.font_families:
            if output_file is None:
                output_file = f"{module_name}.ts"
            
            if generator.generate_typescript_file(output_file, module_name):
                stats = generator.get_statistics()
                print(f"\n✅ TypeScript файл создан: {output_file}")
                print(f"📊 Статистика:")
                print(f"   - Семейств шрифтов: {stats['families_count']}")
                print(f"   - Файлов: {stats['total_files']}")
                print(f"   - Размер: {stats['total_size_mb']} MB")
                print(f"   - Шрифты: {', '.join(stats['families'])}")
                
                # Создаем пример
                example_file = output_file.replace('.ts', '_example.tsx')
                generator.generate_usage_example(example_file)
                print(f"📝 Пример использования: {example_file}")
        else:
            print("❌ Нет загруженных шрифтов")
    else:
        # Режим GUI
        app = FontGeneratorGUI()
        app.run()


if __name__ == "__main__":
    main()