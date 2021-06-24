basic.forever(function () {
    basic.showNumber(kkk.get_temperature())
})
basic.forever(function () {
    serial.writeLine("" + (kkk.get_temperature(OutputNumberFormat.FLOAT)))
})
basic.forever(function () {
	
})
