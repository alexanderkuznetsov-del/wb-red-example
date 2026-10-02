// Пример правила с проверкой роли при записи: свет по движению
// (WB-MSW v.4 Current Motion -> WB-MR6C K1). Запись идёт через wbha.dev(),
// поэтому реле переключает только активный узел.

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

// Принятый риск: таймер выключения (setTimeout) хранится в памяти и
// сбрасывается при перезапуске wb-rules или перезагрузке. Если контроллер
// перезапустится, когда движения давно не было, реле останется в прежнем
// состоянии до следующего срабатывания датчика. Вариант с PersistentStorage
// и cron сложнее; выбран простой вариант, так как перезагрузки контроллеров
// редки.
