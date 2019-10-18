
export const fillArrow = (context, fromx, fromy, tox, toy, r) => {
    let x_center = tox;
    let y_center = toy;

    let angle;
    let x;
    let y;

    context.beginPath();

    angle = Math.atan2(toy-fromy,tox-fromx);
    x = r*Math.cos(angle) + x_center;
    y = r*Math.sin(angle) + y_center;

    context.moveTo(x, y);

    angle += (1/3)*(2*Math.PI);
    x = r*Math.cos(angle) + x_center;
    y = r*Math.sin(angle) + y_center;

    context.lineTo(x, y);

    angle += (1/3)*(2*Math.PI);
    x = r*Math.cos(angle) + x_center;
    y = r*Math.sin(angle) + y_center;

    context.lineTo(x, y);

    context.closePath();

    context.fill();
};

export const strokeLine = (context, x, y, xto, yto) => {
    context.beginPath();

    context.moveTo(x, y);
    context.lineTo(xto, yto);

    context.closePath();
    context.stroke();
};

export const getArrowLine = (context, x, y, xto, yto, size) => {
    fillArrow(context, x, y, xto, yto, size);
    strokeLine(context, x, y, xto, yto)
};

export const drawTextRotated = (context, x, y, r, text) => {
    context.save();
    context.translate(x, y);
    context.rotate(r);

    context.textAlign = 'center';
    context.fillText(text, 0, 0);

    context.restore();
};
