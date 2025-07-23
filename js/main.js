let canvasWidth, canvasHeight;
let game, ui;

window.addEventListener('load', () => {
    // Сначала создаем экземпляр игры
    game = new Game();
    
    // Затем создаем UI и передаем ему ссылку на игру
    ui = new UI(game);
    
    // Обновляем рекорд
    UI.updateHighScore();
}); 