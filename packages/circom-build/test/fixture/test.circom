pragma circom 2.1.5;

template SubComponent() {
    signal input in;

    signal output out <== in * in;
}

template Test() {
    signal input in;
    signal input inMustBeOne;

    signal input inArray[10];

    component sub = SubComponent();
    sub.in <== in;

    signal output out <== sub.out;

    assert(inMustBeOne == 1);
    signal output outMustBeOne <== inMustBeOne * inMustBeOne;

    signal output outAnon <== SubComponent()(in);

    signal output outArray[10] <== [
        inArray[0] * inArray[0],
        inArray[1] * inArray[1],
        inArray[2] * inArray[2],
        inArray[3] * inArray[3],
        inArray[4] * inArray[4],
        inArray[5] * inArray[5],
        inArray[6] * inArray[6],
        inArray[7] * inArray[7],
        inArray[8] * inArray[8],
        inArray[9] * inArray[9]
    ];
}