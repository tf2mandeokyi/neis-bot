const Canvas = require('canvas');
const ScheduleTableUtil = require('../schedule_table_util');



/**
 *  - This function is made by https://stackoverflow.com/users/479489/mizar, and edited by https://stackoverflow.com/users/380725/crazy2be.<br>
 *  - Source at https://stackoverflow.com/a/16599668.<br>
 *  - Divide an entire phrase in an array of phrases, all with the max pixel length given.<br>
 * The words are initially separated by the space char.
 * @param {NodeCanvasRenderingContext2D} ctx 
 * @param {string} text
 * @param {number} maxWidth
 * @return
 */
function getLines(ctx, text, maxWidth) {
    var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}



/**
 * @param {NodeCanvasRenderingContext2D} ctx 
 * @param {{x:number,y:number,w:number,h:number,xw:number,yh:number}} tableRect 
 * @param {{w:number,h:number}} infoCell 
 */
const drawTemplateTable = function(ctx, rect={x,y,w,h,xw,yh}, infoCell={w,h}) {
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
    w: 30,
    h: 35
};
const blank = {
    w: 10,
    h: 10
};
const textlimit = {
    w: 70
}



module.exports.ScheduleTableImageGenerator = {
    /**
     * @param {[Date, string[]][]} table
     */
    generate: function(table) {

        let {min: earliestPeriod, max: latestPeriod, delta: periodcount} = ScheduleTableUtil.getTablePeriodMinMax(table);
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
        ctx.font = '13px NanumGothic';

        drawTemplateTable(ctx, tbrect, tcell);

        ctx.fillStyle = '#000000';

        for(let i=0;i<daycount;i++) { // Vertical line & Date text
            let date = table[i][0];
            let x = tbrect.x+tcell.w+(i+1)*cell.w, tx = tbrect.x+tcell.w+(i+0.5)*cell.w;

            ctx.moveTo(x, tbrect.y);
            ctx.lineTo(x, tbrect.yh);
            ctx.stroke();

            ctx.fillText(
                `${date.getMonth()+1}/${date.getDate()} (${['일', '월', '화', '수', '목', '금', '토'][date.getDay()]})`,
                tx, tbrect.y+0.5*tcell.h
            );

            /*
            ctx.textBaseline = 'bottom';
            ctx.fillText(
                `${date.getMonth()+1}/${date.getDate()}`,
                tx, tbrect.y+0.5*tcell.h
            );

            ctx.textBaseline = 'top';
            ctx.fillText(
                `(${['일', '월', '화', '수', '목', '금', '토'][date.getDay()]})`,
                tx, tbrect.y+0.5*tcell.h
            );
            */

        }

        ctx.textBaseline = 'middle';

        for(let i=0;i<periodcount;i++) { // Horizontal line & Period text
            let y = tbrect.y+tcell.h+(i+1)*cell.h;

            ctx.moveTo(tbrect.x,  y);
            ctx.lineTo(tbrect.xw, y);
            ctx.stroke();

            ctx.fillText(
                earliestPeriod + i,
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
                let textheight = fontsize * 2;

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
}