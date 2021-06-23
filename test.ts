basic.forever(function () {
    basic.showNumber(kkk.light_level())
})
basic.forever(function () {
    serial.writeValue("b", kkk.light_level())
})
basic.forever(function () {
    if (kkk.gt_light_level(50, DARK_BRIGHT.IS_DARK)) {
        basic.showIcon(IconNames.Heart)
        kkk.turn_on()
    } else {
        kkk.turn_off()
    }
})
