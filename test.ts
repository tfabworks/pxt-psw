basic.forever(function () {
    if (PSW.is_man_moving()) {
        PSW.turn_on()
    } else {
        PSW.turn_off()
    }
})
basic.forever(function () {
    basic.showNumber(PSW.light_level())
})
