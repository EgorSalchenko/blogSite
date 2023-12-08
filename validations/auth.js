import { body } from 'express-validator'

export const registerValidation = [
    body('email', "Неправильный email").isEmail(),
    body('password', "Неправильный пароль").isLength({ min: 5 }),
    body('fullName', "Непраильное имя").isLength({ min: 3 }),
    body('avatarUrl', "Непраильная ссылка на аватарку").optional().isURL(),
]