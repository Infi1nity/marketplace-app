import random
import string
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_

from models import Order, OrderStatus
from schemas import OrderCreate, OrderRead, OrderItemSchema

class OrderService:
    
    @staticmethod
    def generate_order_number() -> str:
        """Генерация уникального номера заказа"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"ORD-{timestamp}-{random_str}"
    
    @staticmethod
    def check_stock(product_id: int, quantity: int) -> bool:
        """Проверка наличия товара на складе"""
        # Здесь должна быть логика проверки склада
        # Пример с заглушкой
        return True
    
    @staticmethod
    def reserve_stock(product_id: int, quantity: int) -> bool:
        """Резервирование товара на складе"""
        # Здесь должна быть логика резервирования
        # Пример с заглушкой
        return True
    
    @staticmethod
    def get_cart_items(user_id: int, db: Session) -> List[Dict[str, Any]]:
        """Получение товаров из корзины"""
        # Здесь должна быть логика получения корзины
        # Временная заглушка
        return [
            {
                "product_id": 1,
                "product_name": "Телефон",
                "quantity": 1,
                "price": 50000,
                "total": 50000
            }
        ]
    
    @staticmethod
    def clear_cart(user_id: int, db: Session):
        """Очистка корзины"""
        # Здесь должна быть логика очистки корзины
        pass
    
    @staticmethod
    def create_order(user_id: int, order_data: OrderCreate, db: Session) -> Order:
        """Создание заказа из корзины"""
        
        # 1. Получаем товары из корзины
        cart_items = OrderService.get_cart_items(user_id, db)
        
        if not cart_items:
            raise ValueError("Корзина пуста")
        
        # 2. Проверяем наличие на складе
        for item in cart_items:
            if not OrderService.check_stock(item["product_id"], item["quantity"]):
                raise ValueError(f"Товар {item['product_name']} отсутствует на складе")
        
        # 3. Резервируем товары
        for item in cart_items:
            if not OrderService.reserve_stock(item["product_id"], item["quantity"]):
                raise ValueError(f"Не удалось зарезервировать товар {item['product_name']}")
        
        # 4. Рассчитываем суммы
        subtotal = sum(item["total"] for item in cart_items)
        delivery_fee = 500 if subtotal < 5000 else 0  # Бесплатная доставка от 5000
        total = subtotal + delivery_fee
        
        # 5. Создаем заказ
        order_number = OrderService.generate_order_number()
        
        order = Order(
            user_id=user_id,
            order_number=order_number,
            status=OrderStatus.PENDING,
            items=cart_items,
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            total=total,
            address=order_data.address.model_dump(),
            payment_method=order_data.payment_method.value,
            notes=order_data.notes
        )
        
        db.add(order)
        db.commit()
        db.refresh(order)
        
        # 6. Очищаем корзину
        OrderService.clear_cart(user_id, db)
        
        return order
    
    @staticmethod
    def get_user_orders(user_id: int, db: Session) -> List[Order]:
        """Получение истории заказов пользователя"""
        return db.query(Order).filter(
            Order.user_id == user_id
        ).order_by(Order.created_at.desc()).all()
    
    @staticmethod
    def get_order_by_id(order_id: int, user_id: int, db: Session) -> Order:
        """Получение деталей заказа"""
        order = db.query(Order).filter(
            and_(
                Order.id == order_id,
                Order.user_id == user_id
            )
        ).first()
        
        if not order:
            raise ValueError("Заказ не найден")
        
        return order