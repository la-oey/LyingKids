

function readServer(request){  
  debugLog('initiate server read');
  $.ajax({
      dataType: 'json',
      type: 'POST',
      url: expt.readURL,
      data: { 
        request: JSON.stringify(request)
      },
      beforeSend: function(xhr){
          debugLog('request: ' + JSON.stringify(request));
        },
      success: function(data){
          debugLog('success');
          debugLog(data);

          trial.expt = data['Data']['expt'];
          trial.seed = data['Data']['seed'];
          trial.chain = data['Data']['chain'];
          trial.iter = data['Data']['iter'];
          trial.stimuli = data['Data']['stimuli'];
          startTrial();
        },
      error:function(xhr, status, error){
          debugLog('failure loading data');
          debugLog(xhr.responseText);
          debugLog(status);
          debugLog(error);

          genTrial(expt.default.n);
          startTrial();
        }
      });
}


///// From Tim's Code //////
// function SaveData(curData) {
//    var dataToServer = {
//        'id': client.sid,
//        'experimenter': 'loey',
//        'experimentName': 'trick-or-truth-2',
//        'curData': curData
//    };
  
//    $.post('https://madlab.ucsd.edu/mturk/save.php',
//        dataToServer,
//        function(data) {
//       var newDoc = document.open('text/html', 'replace');
//       newDoc.write('All done, thanks! To submit the HIT, paste this code into Turk: ' + client.sid);
//       newDoc.close();
//        }
//      ).fail(function(data) {
//       var newDoc = document.open('text/html', 'replace');
//       newDoc.write('All done, thanks! To submit the HIT, paste this code into Turk: ' + client.sid);
//       newDoc.close();
//     });
// }            

// function writeServer(data){
//     debugLog('initiate server write');
//   $.ajax({
//       dataType: 'json',
//       type: 'POST',
//       url: saveInfo.dataURL,
//       data: { data: JSON.stringify(data), 
//             experimenter: saveInfo.experimenter,
//             experimentName: saveInfo.experimentName},
//         success: function(data){
//           debugLog('success saving data!');
//         },
//         error:function(xhr, status, error){
//           debugLog('failure saving data');
//           debugLog(xhr.responseText);
//           debugLog(status);
//           debugLog(error);
//         }
//       });
// }

// function writeImgServer(data){
//   $.ajax({
//     type: "POST",
//     url: saveInfo.imgURL,
//     data: { img: data, 
//             name: client.sid,
//             experimenter: saveInfo.experimenter,
//             experimentName: saveInfo.experimentName},
//   }).done(function(o) {
//      console.log('saved'); 
//  })
// }

// function writeVidServer(data){
//   debugLog('initiate server video write');
//   $.ajax({
//       type: 'POST',
//       url: expt.saveVideoURL,
//       data: data,
//       contentType: false,
//       processData: false,
//         success: function(data, recorded){
//           debugLog('success saving data!');
//         },
//         error:function(xhr, status, error){
//           debugLog('failure saving data');
//           debugLog(xhr.responseText);
//           debugLog(status);
//           debugLog(error);
//         }
//       });
// }


