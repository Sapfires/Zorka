// event-utils.js

// Генерация ID для событий (если необходимо)
export function createEventId() {
    return String(new Date().getTime());
}



export const INITIAL_EVENTS = []; // Пустой массив, будет заполняться динамически
