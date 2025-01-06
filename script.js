let flg=new Set();
document.addEventListener('DOMContentLoaded', function() {
    const thisMonth=new Date().getMonth()+1;
    const select=document.getElementById("month");
    let string="";
    let selectMonth=new Date().getDate()>=15?thisMonth+1:thisMonth
    for(let i=1;i<=selectMonth;i++) string+=`<option>${i}月</option>`;
    select.insertAdjacentHTML("beforeend",string);
    select.value=`${thisMonth}月`;

});

function dataGet(){
    const year=Number(document.getElementById("year").value.replace("年",""));
    const month=Number(document.getElementById("month").value.replace("月",""));
    const member=document.getElementById("member");
    while(member.firstChild ){
        member.removeChild( member.firstChild );
    }
    if(window.sessionStorage.getItem(`${year}${month}`)){
        const data=JSON.parse(window.sessionStorage.getItem(`${year}${month}`))
        let string=``;
        for(let i=0;i<Object.keys(data).length-1;i++)
            string+=`<option>${Object.keys(data)[i]}</option>`;
        member.insertAdjacentHTML("beforeend",string);
        member.value="";
        return;
    }
    member.disalbed=true;

    fetch(`https://script.google.com/macros/s/AKfycbwIFhLsMlqMGEhSzNBJJDscjV3P-lAh9n_KY0_4XY36oZu7gl0difbRNpggBRY3dNxa/exec?data=${year},${month}`)
    .then(res=>res.json())
    .then(data=>{
        window.sessionStorage.setItem(`${year}${month}`,JSON.stringify(data));
        let string=``;
        for(let i=0;i<Object.keys(data).length-1;i++)
            string+=`<option>${Object.keys(data)[i]}</option>`;
        member.insertAdjacentHTML("beforeend",string);
        member.value="";
        member.disalbed=false;
        console.log(data)
    })
}

function display(){
    const year=Number(document.getElementById("year").value.replace("年",""));
    const month=Number(document.getElementById("month").value.replace("月",""));
    const member=document.getElementById("member").value;
    const table=document.getElementById("table");
    const data=JSON.parse(window.sessionStorage.getItem(`${year}${month}`));
    if(!data) return;
    let lastDay
    switch (month) {
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
        case 12:
            lastDay=31;
            break;
        case 2:
            if(year%4==0) lastDay=29;
            else lastDay=28;
            break;
        default:
            lastDay=30;
            break;
    }
    string=``;
    let day=["日","月","火","水","木","金","土"];
    while(table.firstChild ){
        table.removeChild( table.firstChild );
    }
    data.color=data.color.map(e=>{if(e=="#f1f8ff")return "#D8EBFF";else return e})
    for(let i=1;i<=lastDay;i++)
        string+=`<tr bgcolor="${data.color[i+1]}"><td>${month}/${i}(${day[new Date(year,month-1,i).getDay()]})</td><td><input type="text" value="${data[member][i-1]}" id="${i}text" oninput="changeFlg()">
        <button onclick="input(this.id)" id="${i}◎">◎</button>
        <button onclick="input(this.id)" id="${i}○">○</button>
        <button onclick="input(this.id)" id="${i}△">△</button>
        <button onclick="input(this.id)" id="${i}×">×</button></td></tr>`;
    string+=`<tr><td>備考</td><td><textarea id="${lastDay+1}text" oninput="changeFlg()">${data[member][31]}</textarea>`
    table.insertAdjacentHTML("beforeend",string)
}

function input(e){
    const text=document.getElementById(`${e.replace(/(\d+)./,"$1")}text`);
    text.value=e.replace(/\d+/,"")+text.value.replace(/◎|○|△|×/,"");
    changeFlg()
}

function changeFlg(){
    const year=Number(document.getElementById("year").value.replace("年",""));
    const month=Number(document.getElementById("month").value.replace("月",""));
    const member=document.getElementById("member").value;
    const table=document.getElementById(`table`);
    const array=[];
    for(let i=0;i<table.childNodes[0].childElementCount;i++)
        array.push(document.getElementById(`${i+1}text`).value);
    const data=JSON.parse(window.sessionStorage.getItem(`${year}${month}`));
    data[member]=array;
    window.sessionStorage.setItem(`${year}${month}`,JSON.stringify(data));
    flg.add(`${year},${month},${member}`);
}

function send(){
    flg.forEach(function(a){
        const year=a.split(",")[0];
        const month=a.split(",")[1];
        const member=a.split(",")[2];
        
        const data={"year":year,"month":month,"member":member,"data":JSON.stringify(JSON.parse(window.sessionStorage.getItem(`${year}${month}`))[member])}
        console.log(data)
        try{
            fetch(`https://script.google.com/macros/s/AKfycbwpMq7qcPHmq9r7ndzALu4s2GBzo_FZeXayZVjIyqnIZVQ5PPc2mDWaxFwQ4B0nHFITpw/exec`,{
                "method":"post",
                "Content-Type": "application/json",
                "body":JSON.stringify(data),
            })
            .then(e=>{
                flg.clear();
                alert("送信が完了しました。");
            })
        }
        catch{
            alert("送信に失敗しました。何故でしょう……");
            return
        }
    })
}