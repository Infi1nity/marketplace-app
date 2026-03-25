#!/usr/bin/env python
# backend/scripts/seed.py

import sys
import os
from pathlib import Path


# Добавляем путь к проекту, чтобы импортировать настройки
sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import SessionLocal
from app.core.config import settings
from app.modules.users.models import User
from app.modules.products.models import Product, Category
from app.modules.cart.models import Cart, CartItem
from app.modules.favorites.models import Favorite
from app.modules.orders.models import Order, OrderItem
from app.modules.orders.models import OrderStatus

import random
from datetime import datetime, timedelta

def seed_users(db):
    """Создание тестовых пользователей"""
    users = []
    for i in range(1, 6):
        user = User(
            email=f"user{i}@example.com",
            username=f"user{i}",
            full_name=f"Тестовый Пользователь {i}",
            hashed_password="hashed_password_here",  # в реальности хешируйте!
            is_active=True,
            is_superuser=(i == 1)  # первый пользователь - админ
        )
        db.add(user)
        users.append(user)
    
    db.flush()  # чтобы получить id
    
    # Для каждого пользователя создаём корзину
    for user in users:
        cart = Cart(user_id=user.id)
        db.add(cart)
    
    return users

def seed_categories(db):
    """Создание категорий товаров"""
    categories = [
        Category(name="Электроника", slug="electronics"),
        Category(name="Одежда", slug="clothing"),
        Category(name="Книги", slug="books"),
        Category(name="Дом и сад", slug="home-garden"),
        Category(name="Спорт", slug="sports"),
    ]
    
    for cat in categories:
        db.add(cat)
    
    db.flush()
    return categories

def seed_products(db, categories):
    """Создание тестовых товаров с изображениями"""
    products_data = [
        # Электроника
        ("iPhone 15", "iphone-15", "Смартфон Apple", 999.99, 15, categories[0].id, "https://m.media-amazon.com/images/I/71vKy5OHuPL.jpg"),
        ("Samsung TV", "samsung-tv", "4K Smart TV", 599.99, 8, categories[0].id, "https://dehanzewitgoed.nl/wp-content/uploads/2024/02/bfd5a476b0c2f4f65aba0471f3d99359.jpg"),
        ("Ноутбук Asus", "notebook-asus", "Для работы и игр", 1299.99, 5, categories[0].id, "https://cdn.kns.ru/linkpics/asus-proart-p16-oled-h7606wx-se042x-90nb17e1-m002w0_kod_1017686-small.jpg"),
        ("Наушники Sony", "sony-headphones", "Беспроводные", 199.99, 20, categories[0].id, "https://netbox.by/image/cache/catalog/Sony/Sony-WF-C500-black-3-min-417x417.jpg"),
        
        # Одежда
        ("Футболка", "t-shirt", "Хлопок 100%", 29.99, 50, categories[1].id, "https://cdn.idol.ru/upload/resize_cache/items/50/id/560_747_1713348519/id4242062618_50_00.jpg"),
        ("Джинсы", "jeans", "Синие классические", 79.99, 30, categories[1].id, "https://conteshop.ru/media/catalog/product/cache/11/image/1405x1879/602f0fa2c1f0d1ba5e241f914e856ff9/e/5/e54fd779db6fe597bf62d42b79681b47.jpg?v=11"),
        ("Куртка", "jacket", "Осенняя", 149.99, 12, categories[1].id, "https://rivernord.com/images/items/01-classic-winter-original-gray.jpg"),
        
        # Книги
        ("Python для всех", "python-for-all", "Учебник по Python", 49.99, 20, categories[2].id, "https://dmkpress.com/images/cms/data/978-5-93700-104-7.jpg"),
        ("Война и мир", "war-and-peace", "Толстой Л.Н.", 19.99, 100, categories[2].id, "https://m.media-amazon.com/images/I/912F83swwRL._UF1000,1000_QL80_.jpg"),
        
        # Дом и сад
        ("Набор посуды", "dishes-set", "6 предметов", 89.99, 15, categories[3].id, "https://posudacenter.ru/upload/iblock/0e0/0e08474f59ac28d18610926eca93c10e.jpg"),
        ("Горшок для цветов", "flower-pot", "Керамический", 14.99, 40, categories[3].id, "https://storage.yandexcloud.net/mostro-gm-media/8eddfcdb-1acc-4fb9-363c-22eff32cb82c/1.jpg"),
        
        # Спорт
        ("Гантели 5кг", "dumbbells-5kg", "Пара", 39.99, 25, categories[4].id, "https://ultra-wod.com/image/cache/catalog/ultra/products/ganteli/gantel_5_1000x1000-1000x1000.jpg"),
        ("Коврик для йоги", "yoga-mat", "Противоскользящий", 24.99, 35, categories[4].id, "https://static.insales-cdn.com/images/products/1/3402/590269770/YM301_800%D1%85800_.jpg"),
    ]
    
    products = []
    for name, slug, desc, price, stock, cat_id, image_url in products_data:
        product = Product(
            name=name,
            slug=slug,
            description=desc,
            price=price,
            stock=stock,
            category_id=cat_id,
            image=image_url,  # 👈 ДОБАВЛЯЕМ ИЗОБРАЖЕНИЕ
            is_active=True
        )
        db.add(product)
        products.append(product)
    
    db.flush()
    return products

def seed_cart_items(db, users, products):
    """Добавление товаров в корзины"""
    for user in users[:3]:  # первые 3 пользователя
        # Находим корзину пользователя
        cart = db.query(Cart).filter(Cart.user_id == user.id).first()
        if cart:
            # Добавляем 2-3 случайных товара в корзину
            for product in random.sample(products, random.randint(2, 3)):
                cart_item = CartItem(
                    cart_id=cart.id,
                    product_id=product.id,
                    quantity=random.randint(1, 3)
                )
                db.add(cart_item)

def seed_favorites(db, users, products):
    """Добавление товаров в избранное"""
    for user in users:
        # Каждый пользователь добавляет 3-5 товаров в избранное
        for product in random.sample(products, random.randint(3, 5)):
            favorite = Favorite(
                user_id=user.id,
                product_id=product.id
            )
            db.add(favorite)

def seed_orders(db, users, products):
    """Создание тестовых заказов"""
    statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    
    for user in users[:4]:  # первые 4 пользователя
        # Каждый делает 1-3 заказа
        for _ in range(random.randint(1, 3)):
            # Выбираем 2-4 товара для заказа
            order_items = []
            total = 0
            for product in random.sample(products, random.randint(2, 4)):
                quantity = random.randint(1, 2)
                price = product.price
                total += price * quantity
                order_items.append({
                    'product_id': product.id,
                    'quantity': quantity,
                    'price': price
                })
            
            # Создаём заказ
            order = Order(
                user_id=user.id,
                status=random.choice(list(OrderStatus)),
                total_amount=total,
                shipping_address=f"ул. Тестовая, д. {random.randint(1, 100)}",
                contact_phone=f"+7{random.randint(900, 999)}{random.randint(1000000, 9999999)}",
                created_at=datetime.now() - timedelta(days=random.randint(1, 30))
            )
            db.add(order)
            db.flush()  # чтобы получить id заказа
            
            # Создаём позиции заказа
            for item in order_items:
                order_item = OrderItem(
                    order_id=order.id,
                    product_id=item['product_id'],
                    quantity=item['quantity'],
                    price=item['price']
                )
                db.add(order_item)

    

def main():
    """Главная функция"""
    print("🌱 Начинаем сидирование базы данных...")
    
    # Создаём сессию БД
    db = SessionLocal()
    
    try:
        # Очищаем существующие данные (в правильном порядке из-за связей)
        print("Очистка старых данных...")
        db.query(OrderItem).delete()
        db.query(Order).delete()
        db.query(Favorite).delete()
        db.query(CartItem).delete()
        db.query(Cart).delete()
        db.query(Product).delete()
        db.query(Category).delete()
        db.query(User).delete()
        db.commit()
        
        # Создаём новые данные
        print("Создание пользователей...")
        users = seed_users(db)
        
        print("Создание категорий...")
        categories = seed_categories(db)
        
        print("Создание товаров...")
        products = seed_products(db, categories)
        
        print("Наполнение корзин...")
        seed_cart_items(db, users, products)
        
        print("Добавление в избранное...")
        seed_favorites(db, users, products)
        
        print("Создание заказов...")
        seed_orders(db, users, products)
        
        # Сохраняем все изменения
        db.commit()
        
        print(f"✅ Сидирование завершено успешно!")
        print(f"   Создано:")
        print(f"   - {len(users)} пользователей")
        print(f"   - {len(categories)} категорий")
        print(f"   - {len(products)} товаров")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()