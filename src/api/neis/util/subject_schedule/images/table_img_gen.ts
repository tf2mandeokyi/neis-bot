import * as Canvas from 'canvas';
import * as DateUtil from '../../dateutil';
import * as ScheduleTableUtil from '../schedule_util';



/**
 *  - This function is made by https://stackoverflow.com/users/479489/mizar, edited by https://stackoverflow.com/users/380725/crazy2be, and partially edited by me.<br>
 *  - Source at https://stackoverflow.com/a/16599668.<br>
 *  - Divide an entire phrase in an array of phrases, all with the max pixel length given.<br>
 * The words are initially separated by the space char.
 */
function getLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) : string[] { // -(자)예술·체육활동
    if(text.startsWith('-')) text = text.substr(1);
    var words = text.split(/(?<=[·()-_ ])/g);
    var lines : string[] = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + word).width;
        if (width < maxWidth) {
            currentLine += word;
        } else {
            if(currentLine.endsWith(' ')) {
                lines.push(currentLine.slice(0, currentLine.length-1));
            }
            else lines.push(currentLine);
            currentLine = word;
            if(currentLine.startsWith(' ')) currentLine = currentLine.substr(1);
        }
    }
    lines.push(currentLine);
    return lines;
}



function drawTemplateTable(
        ctx: CanvasRenderingContext2D,
        rect: {x:number,y:number,w:number,h:number,xw:number,yh:number},
        infoCell: {w:number,h:number}
) {
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#bbbbbb';
    ctx.lineWidth = 2;

    ctx.fillRect(rect.x, rect.y, rect.w, infoCell.h)
    ctx.fillRect(rect.x, rect.y, infoCell.w, rect.h)
    ctx.beginPath()
    ctx.rect(rect.x, rect.y, rect.w, infoCell.h)
    ctx.rect(rect.x, rect.y, infoCell.w, rect.h)
    ctx.stroke();

    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.stroke();
}



const cell = {
    w: 80,
    h: 60
};
const tcell = {
    w: 20,
    h: 25
};
const blank = {
    w: 10,
    h: 10
};
const textlimit = {
    w: 70
}



export function generate(table: [Date, string[]][]) {

    let {min: earliestPeriod, delta: periodcount} = ScheduleTableUtil.getTablePeriodMinMax(table);
    let daycount = table.length;
    
    const tbrect = {
        x: blank.w,
        y: blank.h,
        w: tcell.w+daycount*cell.w,
        h: cell.h*periodcount+tcell.h,
        xw: blank.w+tcell.w+daycount*cell.w,
        yh: blank.h+cell.h*periodcount+tcell.h
    }

    const canvas = Canvas.createCanvas(2*blank.w+tbrect.w, 2*blank.h+tbrect.h);
    const ctx = canvas.getContext('2d');

    Canvas.registerFont('./resources/fonts/NanumGothic-Regular.ttf', { family: 'NanumGothic' });

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 2*blank.w+tbrect.w, 2*blank.h+tbrect.h); // White background

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    drawTemplateTable(ctx, tbrect, tcell);

    ctx.fillStyle = 'rgba(255, 0, 0, 0.15)'
    ctx.fillRect(tbrect.x+tcell.w, tbrect.y, cell.w, tbrect.h); // Sunday

    ctx.fillStyle = 'rgba(0, 0, 255, 0.15)'
    ctx.fillRect(tbrect.x+tcell.w+6*cell.w, tbrect.y, cell.w, tbrect.h); // Saturday

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 13px NanumGothic';

    for(let i=0;i<daycount;i++) { // Vertical line & Date text
        let date = table[i][0];
        let x = tbrect.x+tcell.w+(i+1)*cell.w, tx = tbrect.x+tcell.w+(i+0.5)*cell.w;

        ctx.moveTo(x, tbrect.y);
        ctx.lineTo(x, tbrect.yh);
        ctx.stroke();

        ctx.fillText(
            `${date.getMonth()+1}/${date.getDate()} (${DateUtil.weekdays[date.getDay()]})`,
            tx, tbrect.y+0.5*tcell.h
        );

    }

    ctx.textBaseline = 'middle';
    ctx.font = '13px NanumGothic';

    for(let i=0;i<periodcount;i++) { // Horizontal line & Period text
        let y = tbrect.y+tcell.h+(i+1)*cell.h;

        ctx.moveTo(tbrect.x,  y);
        ctx.lineTo(tbrect.xw, y);
        ctx.stroke();

        ctx.fillText(
            (earliestPeriod + i) + '',
            tbrect.x+0.5*tcell.w, tbrect.y+tcell.h+(i+0.5)*cell.h
        )
    }

    for(let y=0;y<periodcount;y++) { // Subjects
        for(let x=0;x<daycount;x++) {

            let subject = table[x][1][y-earliestPeriod+2] || '';

            let fontsize = 20;
            ctx.font = '20px NanumGothic';

            let metrics = ctx.measureText(subject);
            let textwidth = metrics.width;
            if(textwidth > textlimit.w) {
                fontsize = Math.floor(20*textlimit.w/textwidth);
                ctx.font = `${Math.max(fontsize, 12)}px NanumGothic`;
            }

            let lines = getLines(ctx, subject, textlimit.w);
            let textheight = fontsize * 2.2;

            lines.forEach((line, i) => {
                ctx.fillText(
                    line,
                    tbrect.x+tcell.w+(x+0.5)*cell.w, tbrect.y+tcell.h+(y+0.5)*cell.h + (i-(lines.length-1)/2)*textheight
                )
            })
        }
    }

    return canvas;
}