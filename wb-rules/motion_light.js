// Пример реальной автоматики, использующей арбитраж записи: свет по
// движению (WB-MSW v.4 Current Motion -> WB-MR6C K1). Запись идёт через
// wbha.dev() - реально щёлкает реле только активный узел.

var wbha = require("wbha");

var MOTION_THRESHOLD = 50;   // выше - считаем, что движение есть
var OFF_DELAY_MS = 30000;    // 30 секунд без движения - выключить

var offTimer = null;

function scheduleOff() {
    if (offTimer !== null) {
        clearTimeout(offTimer);
    }
    offTimer = setTimeout(function () {
        offTimer = null;
        wbha.dev("wb-mr6c_112/K1", false);
    }, OFF_DELAY_MS);
}

defineRule("motion_light", {
    whenChanged: "wb-msw-v4_155/Current Motion",
    then: function (newValue) {
        if (newValue > MOTION_THRESHOLD) {
            wbha.dev("wb-mr6c_112/K1", true);
            scheduleOff();
        }
    }
});

// Осознанно принятый риск: таймер выключения - setTimeout в памяти, не
// переживает рестарт/перезагрузку. Если контроллер перезапустится, пока
// движения давно не было - реле останется в прежнем состоянии до следующего
// реального срабатывания датчика. Альтернатива (PersistentStorage + cron)
// добавляет сложность - выбор в пользу простоты сделан осознанно для
// случая, когда перезагрузки контроллеров редки.
