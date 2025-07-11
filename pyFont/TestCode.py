#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для импорта пользовательских шрифтов в ReportLab для создания PDF.
Поддерживает TTF, OTF форматы шрифтов с автоматической регистрацией.
"""

import os
import sys
from pathlib import Path
from typing import List, Dict, Optional, Tuple
import logging
from dataclasses import dataclass
import tkinter as tk
from tkinter import filedialog, messagebox, ttk

try:
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.lib.fonts import addMapping
except ImportError:
    print("Ошибка: Библиотека ReportLab не установлена.")
    print("Установите её командой: pip install reportlab")
    sys.exit(1)


@dataclass
class FontInfo:
    """Информация о шрифте"""
    name: str
    path: str
    family: str
    is_bold: bool = False
    is_italic: bool = False


class FontImporter:
    """Класс для импорта и регистрации шрифтов в ReportLab"""
    
    def __init__(self):
        self.logger = self._setup_logger()
        self.registered_fonts: Dict[str, FontInfo] = {}
        self.supported_extensions = {'.ttf', '.otf'}
    
    def _setup_logger(self) -> logging.Logger:
        """Настройка логирования"""
        logger = logging.getLogger('FontImporter')
        logger.setLevel(logging.INFO)
        
        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)
        
        return logger
    
    def _detect_font_style(self, font_name: str) -> Tuple[bool, bool]:
        """Определение стиля шрифта по имени файла"""
        name_lower = font_name.lower()
        
        is_bold = any(keyword in name_lower for keyword in [
            'bold', 'жирный', 'thick', 'heavy', 'black'
        ])
        
        is_italic = any(keyword in name_lower for keyword in [
            'italic', 'курсив', 'oblique', 'slanted'
        ])
        
        return is_bold, is_italic
    
    def _extract_font_family(self, font_name: str) -> str:
        """Извлечение имени семейства шрифта"""
        # Удаляем расширение и стилевые суффиксы
        family = Path(font_name).stem
        
        # Удаляем общие стилевые суффиксы
        style_suffixes = [
            '-Bold', '-Italic', '-BoldItalic', '-Regular',
            'Bold', 'Italic', 'Regular', 'Light', 'Medium',
            'Жирный', 'Курсив', 'Обычный'
        ]
        
        for suffix in style_suffixes:
            if family.endswith(suffix):
                family = family[:-len(suffix)]
                break
        
        return family.strip('-_ ')
    
    def register_font(self, font_path: str, font_name: Optional[str] = None) -> bool:
        """
        Регистрация одного шрифта в ReportLab
        
        Args:
            font_path: Путь к файлу шрифта
            font_name: Пользовательское имя шрифта (опционально)
            
        Returns:
            True если успешно зарегистрирован, False в противном случае
        """
        try:
            path_obj = Path(font_path)
            
            if not path_obj.exists():
                self.logger.error(f"Файл шрифта не найден: {font_path}")
                return False
            
            if path_obj.suffix.lower() not in self.supported_extensions:
                self.logger.error(f"Неподдерживаемый формат: {path_obj.suffix}")
                return False
            
            # Определяем имя шрифта
            if font_name is None:
                font_name = path_obj.stem
            
            # Создаем объект шрифта
            font = TTFont(font_name, font_path)
            
            # Регистрируем в ReportLab
            pdfmetrics.registerFont(font)
            
            # Определяем стиль и семейство
            is_bold, is_italic = self._detect_font_style(font_name)
            family = self._extract_font_family(font_name)
            
            # Сохраняем информацию о шрифте
            font_info = FontInfo(
                name=font_name,
                path=font_path,
                family=family,
                is_bold=is_bold,
                is_italic=is_italic
            )
            
            self.registered_fonts[font_name] = font_info
            
            # Добавляем маппинг для семейства шрифтов
            self._add_font_mapping(font_info)
            
            self.logger.info(f"Шрифт успешно зарегистрирован: {font_name}")
            return True
            
        except Exception as e:
            self.logger.error(f"Ошибка при регистрации шрифта {font_path}: {e}")
            return False
    
    def _add_font_mapping(self, font_info: FontInfo):
        """Добавление маппинга шрифта для семейства"""
        try:
            # Определяем стиль для маппинга
            if font_info.is_bold and font_info.is_italic:
                addMapping(font_info.family, 1, 1, font_info.name)  # Bold + Italic
            elif font_info.is_bold:
                addMapping(font_info.family, 1, 0, font_info.name)  # Bold
            elif font_info.is_italic:
                addMapping(font_info.family, 0, 1, font_info.name)  # Italic
            else:
                addMapping(font_info.family, 0, 0, font_info.name)  # Regular
                
        except Exception as e:
            self.logger.warning(f"Не удалось добавить маппинг для {font_info.name}: {e}")
    
    def register_fonts_from_directory(self, directory_path: str) -> int:
        """
        Регистрация всех шрифтов из указанной директории
        
        Args:
            directory_path: Путь к директории со шрифтами
            
        Returns:
            Количество успешно зарегистрированных шрифтов
        """
        path_obj = Path(directory_path)
        
        if not path_obj.exists() or not path_obj.is_dir():
            self.logger.error(f"Директория не найдена: {directory_path}")
            return 0
        
        registered_count = 0
        
        for file_path in path_obj.iterdir():
            if file_path.suffix.lower() in self.supported_extensions:
                if self.register_font(str(file_path)):
                    registered_count += 1
        
        self.logger.info(f"Зарегистрировано {registered_count} шрифтов из {directory_path}")
        return registered_count
    
    def register_multiple_fonts(self, font_paths: List[str]) -> int:
        """
        Регистрация нескольких шрифтов
        
        Args:
            font_paths: Список путей к файлам шрифтов
            
        Returns:
            Количество успешно зарегистрированных шрифтов
        """
        registered_count = 0
        
        for font_path in font_paths:
            if self.register_font(font_path):
                registered_count += 1
        
        return registered_count
    
    def get_registered_fonts(self) -> Dict[str, FontInfo]:
        """Получение списка зарегистрированных шрифтов"""
        return self.registered_fonts.copy()
    
    def get_font_families(self) -> List[str]:
        """Получение списка семейств шрифтов"""
        families = set()
        for font_info in self.registered_fonts.values():
            families.add(font_info.family)
        return sorted(list(families))


class FontImporterGUI:
    """GUI для импорта шрифтов"""
    
    def __init__(self):
        self.importer = FontImporter()
        self.root = tk.Tk()
        self.setup_ui()
    
    def setup_ui(self):
        """Настройка интерфейса"""
        self.root.title("Импортер шрифтов для PDF")
        self.root.geometry("600x500")
        
        # Основной фрейм
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Кнопки выбора шрифтов
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=0, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))
        
        ttk.Button(
            button_frame,
            text="Выбрать файлы шрифтов",
            command=self.select_font_files
        ).grid(row=0, column=0, padx=(0, 5))
        
        ttk.Button(
            button_frame,
            text="Выбрать папку со шрифтами",
            command=self.select_font_directory
        ).grid(row=0, column=1, padx=5)
        
        # Список зарегистрированных шрифтов
        ttk.Label(main_frame, text="Зарегистрированные шрифты:").grid(
            row=1, column=0, columnspan=2, sticky=tk.W, pady=(10, 5)
        )
        
        # Treeview для отображения шрифтов
        columns = ('name', 'family', 'style', 'path')
        self.tree = ttk.Treeview(main_frame, columns=columns, show='headings', height=15)
        
        self.tree.heading('name', text='Имя')
        self.tree.heading('family', text='Семейство')
        self.tree.heading('style', text='Стиль')
        self.tree.heading('path', text='Путь')
        
        self.tree.column('name', width=150)
        self.tree.column('family', width=120)
        self.tree.column('style', width=80)
        self.tree.column('path', width=200)
        
        self.tree.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S), pady=5)
        
        # Scrollbar для treeview
        scrollbar = ttk.Scrollbar(main_frame, orient=tk.VERTICAL, command=self.tree.yview)
        scrollbar.grid(row=2, column=2, sticky=(tk.N, tk.S))
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        # Информационная панель
        info_frame = ttk.LabelFrame(main_frame, text="Информация", padding="5")
        info_frame.grid(row=3, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(10, 0))
        
        self.info_label = ttk.Label(
            info_frame,
            text="Выберите шрифты для регистрации в ReportLab"
        )
        self.info_label.grid(row=0, column=0, sticky=tk.W)
        
        # Настройка растягивания
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(2, weight=1)
    
    def select_font_files(self):
        """Выбор файлов шрифтов"""
        file_paths = filedialog.askopenfilenames(
            title="Выберите файлы шрифтов",
            filetypes=[
                ("Файлы шрифтов", "*.ttf *.otf"),
                ("TrueType шрифты", "*.ttf"),
                ("OpenType шрифты", "*.otf"),
                ("Все файлы", "*.*")
            ]
        )
        
        if file_paths:
            registered_count = self.importer.register_multiple_fonts(list(file_paths))
            self.update_font_list()
            self.info_label.config(
                text=f"Зарегистрировано {registered_count} из {len(file_paths)} шрифтов"
            )
    
    def select_font_directory(self):
        """Выбор папки со шрифтами"""
        directory_path = filedialog.askdirectory(
            title="Выберите папку со шрифтами"
        )
        
        if directory_path:
            registered_count = self.importer.register_fonts_from_directory(directory_path)
            self.update_font_list()
            self.info_label.config(
                text=f"Зарегистрировано {registered_count} шрифтов из папки"
            )
    
    def update_font_list(self):
        """Обновление списка шрифтов в интерфейсе"""
        # Очищаем список
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # Добавляем зарегистрированные шрифты
        for font_info in self.importer.get_registered_fonts().values():
            style_parts = []
            if font_info.is_bold:
                style_parts.append("Жирный")
            if font_info.is_italic:
                style_parts.append("Курсив")
            
            style = ", ".join(style_parts) if style_parts else "Обычный"
            
            self.tree.insert('', tk.END, values=(
                font_info.name,
                font_info.family,
                style,
                font_info.path
            ))
    
    def run(self):
        """Запуск GUI"""
        self.root.mainloop()


def create_test_pdf(font_importer: FontImporter, output_path: str = "test_fonts.pdf"):
    """
    Создание тестового PDF с использованием зарегистрированных шрифтов
    
    Args:
        font_importer: Экземпляр FontImporter с зарегистрированными шрифтами
        output_path: Путь для сохранения тестового PDF
    """
    try:
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        
        doc = SimpleDocTemplate(output_path)
        styles = getSampleStyleSheet()
        story = []
        
        # Заголовок
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=30
        )
        
        story.append(Paragraph("Тест зарегистрированных шрифтов", title_style))
        story.append(Spacer(1, 12))
        
        # Тестирование каждого зарегистрированного шрифта
        for font_name, font_info in font_importer.get_registered_fonts().items():
            try:
                test_style = ParagraphStyle(
                    f'Test_{font_name}',
                    parent=styles['Normal'],
                    fontName=font_name,
                    fontSize=12,
                    spaceAfter=12
                )
                
                text = f"Шрифт: {font_name} (Семейство: {font_info.family})<br/>"
                text += "Быстрая коричневая лиса прыгает через ленивую собаку.<br/>"
                text += "1234567890 !@#$%^&*()_+-=[]{}|;':\",./<>?"
                
                story.append(Paragraph(text, test_style))
                
            except Exception as e:
                print(f"Ошибка при тестировании шрифта {font_name}: {e}")
        
        doc.build(story)
        print(f"Тестовый PDF создан: {output_path}")
        
    except Exception as e:
        print(f"Ошибка при создании тестового PDF: {e}")


def main():
    """Основная функция"""
    if len(sys.argv) > 1:
        # Режим командной строки
        font_importer = FontImporter()
        
        for arg in sys.argv[1:]:
            path_obj = Path(arg)
            
            if path_obj.is_file():
                font_importer.register_font(str(path_obj))
            elif path_obj.is_dir():
                font_importer.register_fonts_from_directory(str(path_obj))
            else:
                print(f"Путь не найден: {arg}")
        
        # Создаем тестовый PDF
        if font_importer.get_registered_fonts():
            create_test_pdf(font_importer)
            
            print("\nЗарегистрированные шрифты:")
            for name, info in font_importer.get_registered_fonts().items():
                print(f"  {name} ({info.family})")
    else:
        # Режим GUI
        app = FontImporterGUI()
        app.run()


if __name__ == "__main__":
    main()