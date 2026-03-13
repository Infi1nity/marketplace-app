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
    """Создание тестовых товаров"""
    products_data = [
        # Электроника
        ("iPhone 15", "Смартфон Apple", 999.99, 15, categories[0].id),
        ("Samsung TV", "4K Smart TV", 599.99, 8, categories[0].id),
        ("Ноутбук Asus", "Для работы и игр", 1299.99, 5, categories[0].id),
        
        # Одежда
        ("Футболка", "Хлопок 100%", 29.99, 50, categories[1].id),
        ("Джинсы", "Синие классические", 79.99, 30, categories[1].id),
        ("Куртка", "Осенняя", 149.99, 12, categories[1].id),
        
        # Книги
        ("Python для всех", "Учебник по Python", 49.99, 20, categories[2].id),
        ("Война и мир", "Толстой Л.Н.", 19.99, 100, categories[2].id),
        
        # Дом и сад
        ("Набор посуды", "6 предметов", 89.99, 15, categories[3].id),
        ("Горшок для цветов", "Керамический", 14.99, 40, categories[3].id),
        
        # Спорт
        ("Гантели 5кг", "Пара", 39.99, 25, categories[4].id),
        ("Коврик для йоги", "Противоскользящий", 24.99, 35, categories[4].id),
    ]
    
    products = []
    for name, desc, price, stock, cat_id in products_data:
        product = Product(
            name=name,
            slug=name.lower().replace(" ", "-"),
            description=desc,
            price=price,
            stock=stock,
            category_id=cat_id,
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