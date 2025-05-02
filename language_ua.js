const keyboards = {
    
    mainMenu: {
        inline_keyboard: [
            [{ text: `🎫 Купити квиток `, callback_data: 'buyTicket' }],
            [{ text: `🗺️ Вибрати маршрут `, callback_data: 'selectRoute' }],
            [{ text: `🧑‍💼 Мій профіль `, callback_data: 'myProfile' }],
            [{ text: `📩 Служба підтримки `, callback_data: 'support' }, { text: `❗❓ Питання `, callback_data: 'support' }]
        ]
    },

    selectArea: {
        inline_keyboard: [
            [{ text: 'Створити замовлення', callback_data: 'local' }],
          //  [{ text: 'Поїздка по Україні', callback_data: 'domestics' }],
          //  [{ text: 'Поїздка за кордон', callback_data: 'international' }],         
          //  [{ text: `📩 Служба підтримки `, callback_data: 'support' }, { text: `❗❓ Питання `, callback_data: 'inquiry' }]            
        ]
    },

    requestName: {
        inline_keyboard: [
            [{ text: 'Введіть назву вашого бізнесу', callback_data: 'defaultAddress' }],
          //  [{ text: 'Поїздка по Україні', callback_data: 'domestics' }],
          //  [{ text: 'Поїздка за кордон', callback_data: 'international' }],         
          //  [{ text: `📩 Служба підтримки `, callback_data: 'support' }, { text: `❗❓ Питання `, callback_data: 'inquiry' }]            
        ]
    },

    contactRequest: {
        keyboard: [
            [{ text: 'Поділитися номером', request_contact: true }]
        ],
        one_time_keyboard: true,
        resize_keyboard: true
    },
    dataConfirmation: {
        keyboard: [
            [{ text: 'Так, Оформити замовлення' }],
            [{ text: 'Ні, повторити введення' }],
            [{ text: '/start' }]
        ],
        one_time_keyboard: true,
        resize_keyboard: true
    },
    
    shareNumber: { keyboard: [
        [{ 
            text: 'Поділитися номером',
            request_contact: true, 
        }]
      ], 
        resize_keyboard: true,
        one_time_keyboard: true 
    },
};

const phrases = {
    botInformation: `
Поїздки по Києву, Україні та за кордон.
Приватні замовлення та регулярні маршрути на автотранспорті марки Mercedes різної пасажиромісткості
Вартість замовлення в одній країні 1000 грн.
`,
    askNumber: `Будь ласка, надішліть свій номер телефону за допомогою кнопки нижче  👇:`,
    mainMenu: `Головне меню`,
    requestedName: 'Введіть назву вашого бізнесу',
    defaultAddress: `Введіть основну адресу пікапу`,
    select: `Будь ласка, зробіть вибір 👇:`,
    departure: `Для оформлення квитка оберіть місто відправлення 👇:`,
    localDepCity: `Що доставляємо 👇:`,
    route: `Оберіть маршрут поїздки 👇:`,
    ride: `Оберіть дату та час поїздки 👇 або напишіть свою у форматі, рік.місяць.день, за допомогою клавіатури. 
Наприклад, 01.12.2024. Або дату і час в форматі 18:00.01.12.2024`,
    seat: `Будь ласка, оберіть місце 👇:`,
    geolocation: 'Будь ласка, надішліть свою геопозицію:',
    sendGeo: 'Або відправ геопозицію',
    taxiOnTheWay: 'Вкажіть ціну замовлення',
    localBookingWrong: 'Трапилась помилка при бронюванні поїздки',
    orderTaken: 'Замовлення прийнято',
    sendAddress: 'Напиши текстом адресу отримувача',
    leaveComment: `Залиште коментар для курєра 👇:`,
    rules: `Вкажіть номер телефону клієнта`,
    pickup: `Вкажіть адресу відправки`,
    comentReceived: 'Коментар отримано',
    noRides: 'Відсутні рейси за даним маршрутом на вказану дату',
    noRoutes: 'Зі вказаного міста відсутні маршрути',
    noSeates: 'Відсутні вільні місця за заданим рейсом',
    paymantAmount: 'Введіть сумму платежу',
    wrongAmount: 'Некоректна сума',
    successPay: 'Замовлення успішно розміщене',
    successSaved: 'Данні успішно збережено'
}

// Export the keyboards object
export { keyboards, phrases };
