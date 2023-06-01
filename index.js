var axios = require("axios").default;
var fs = require('fs');
var path = require('path');
const { jsPDF } = require("jspdf");
require('dotenv').config();
require("jspdf-autotable");

var options = {
  method: 'POST',
  url: process.env.API_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: process.env.API_AUTH
  },
  data: {
    request: {
      method: 'switchvox.callLogs.search',
      parameters: {
        start_date: '2023-05-21 07:00:00',
        end_date: '2023-05-26 18:00:00',
        account_ids: ['1120'],
          items_per_page: '10'
      }
    }
  }
};
var apiRes;
axios.request(options).then(function (response) {
    apiRes = response.data;
    var doc = new jsPDF('p');
    var finalY = doc.lastAutoTable.finalY || 38
    let logoPath = path.resolve('./assets/advantech_logo.png');
    let logo = fs.readFileSync(logoPath, { encoding: 'base64' });
    doc.addImage(logo, 'PNG', 14, 14, 102, 22);
    doc.text('Switchvox Call Log', 14, 45);
    apiRes.response.result.calls.call.forEach(element => {
        var eventData = '';
        element.events.event.forEach(event => {
            eventData +=  event.type + ' - ' + event.start_time + ' - ' + event.display + '\n';
        });
        doc.autoTable({
            startY: finalY + 10,
            theme: 'grid',
            body: [
                ['Time', element.start_time],
                ['From', element.from],
                ['To', element.to],
                ['Duration', element.total_duration],
                ['Events', eventData]
            ]
        });
        finalY = doc.lastAutoTable.finalY
    });
    doc.save('table.pdf');
}).catch (function (error) {
    console.error(error);
})

