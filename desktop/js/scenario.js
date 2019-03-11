/* This file is part of Jeedom.
*
* Jeedom is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Jeedom is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Jeedom. If not, see <http://www.gnu.org/licenses/>.
*/

$('.backgroundforJeedom').css('background-position','bottom right');
$('.backgroundforJeedom').css('background-size','auto');
$('.backgroundforJeedom').css('background-repeat','no-repeat');


document.addEventListener('keydown', function(event) {
  //in expression input or textarea:
  if (event.target.classList.contains('expressionAttr')){
    if ((27 === event.which) || (13 === event.which)){
      event.preventDefault()
      $(event.target).blur()
    }
  }
})

tab = null;
var url = document.location.toString();
if (url.match('#')) {
  $('.nav-tabs a[href="#' + url.split('#')[1] + '"]').click();
}
$('.nav-tabs a').on('shown.bs.tab', function (e) {
  window.location.hash = e.target.hash;
})

$(function(){
  try{
    $.contextMenu('destroy', $('.nav.nav-tabs'));
    jeedom.scenario.all({
      error: function (error) {
        $('#div_alert').showAlert({message: error.message, level: 'danger'});
      },
      success: function (scenarios) {
        if(scenarios.length == 0){
          return;
        }
        scenarioGroups = []
        for(i=0; i<scenarios.length; i++){
          group = scenarios[i].group
          if (group == "") group = 'Aucun'
          group = group[0].toUpperCase() + group.slice(1)
          scenarioGroups.push(group)
        }
        scenarioGroups = Array.from(new Set(scenarioGroups))
        scenarioGroups.sort()
        scenarioList = []
        for(i=0; i<scenarioGroups.length; i++)
        {
          group = scenarioGroups[i]
          scenarioList[group] = []
          for(j=0; j<scenarios.length; j++)
          {
            sc = scenarios[j]
            scGroup = sc.group
            if (scGroup == "") scGroup = 'Aucun'
            if (scGroup.toLowerCase() != group.toLowerCase()) continue
            scenarioList[group].push([sc.name, sc.id])
          }
        }
        //set context menu!
        var contextmenuitems = {}
        for (var group in scenarioList) {
          groupScenarios = scenarioList[group]
          items = {}
          for (var index in groupScenarios) {
            sc = groupScenarios[index]
            scName = sc[0]
            scId = sc[1]
            items[scId] = {'name': scName}
          }
          contextmenuitems[group] = {'name':group, 'items':items}
        }
        
        $('.nav.nav-tabs').contextMenu({
          selector: 'li',
          autoHide: true,
          zIndex: 9999,
          className: 'scenario-context-menu',
          callback: function(key, options) {
            url = 'index.php?v=d&p=scenario&id=' + key;
            if (document.location.toString().match('#')) {
              url += '#' + document.location.toString().split('#')[1];
            }
            loadPage(url);
          },
          items: contextmenuitems
        })
      }
    })
  }
  catch(err) {}
})

editor = [];
pColor = 0;

autoCompleteCondition = [
  {val: 'rand(MIN,MAX)'},
  {val: '#heure#'},
  {val: '#jour#'},
  {val: '#mois#'},
  {val: '#annee#'},
  {val: '#date#'},
  {val: '#time#'},
  {val: '#timestamp#'},
  {val: '#semaine#'},
  {val: '#sjour#'},
  {val: '#minute#'},
  {val: '#IP#'},
  {val: '#hostname#'},
  {val: 'variable(mavariable,defaut)'},
  {val: 'delete_variable(mavariable)'},
  {val: 'tendance(commande,periode)'},
  {val: 'average(commande,periode)'},
  {val: 'max(commande,periode)'},
  {val: 'min(commande,periode)'},
  {val: 'round(valeur)'},
  {val: 'trigger(commande)'},
  {val: 'randomColor(debut,fin)'},
  {val: 'lastScenarioExecution(scenario)'},
  {val: 'stateDuration(commande)'},
  {val: 'lastChangeStateDuration(commande,value)'},
  {val: 'median(commande1,commande2)'},
  {val: 'time(value)'},
  {val: 'collectDate(cmd)'},
  {val: 'valueDate(cmd)'},
  {val: 'eqEnable(equipement)'},
  {val: 'name(type,commande)'},
  {val: 'value(commande)'},
  {val: 'lastCommunication(equipement)'},
  {val: 'color_gradient(couleur_debut,couleur_fin,valuer_min,valeur_max,valeur)'}
];
autoCompleteAction = ['tag','report','sleep', 'variable', 'delete_variable', 'scenario', 'stop', 'wait','gotodesign','log','message','equipement','ask','jeedom_poweroff','scenario_return','alert','popup','icon','event','remove_inat'];

if (getUrlVars('saveSuccessFull') == 1) {
  $('#div_alert').showAlert({message: '{{Sauvegarde effectuée avec succès}}', level: 'success'});
}

setTimeout(function(){
  $('.scenarioListContainer').packery();
},100);

$("#div_listScenario").trigger('resize');

$('.scenarioListContainer').packery();

$('#bt_scenarioThumbnailDisplay').off('click').on('click', function () {
  $('#div_editScenario').hide();
  $('#scenarioThumbnailDisplay').show();
  $('.scenarioListContainer').packery();
});

$('.scenarioDisplayCard').off('click').on('click', function () {
  $('#scenarioThumbnailDisplay').hide();
  printScenario($(this).attr('data-scenario_id'));
  if(document.location.toString().split('#')[1] == '' || document.location.toString().split('#')[1] == undefined){
    $('.nav-tabs a[href="#generaltab"]').click();
  }
});

$('.accordion-toggle').off('click').on('click', function () {
  setTimeout(function(){
    $('.scenarioListContainer').packery();
  },100);
});


$("#div_tree").jstree({
  "plugins": ["search"]
});
$('#in_treeSearch').keyup(function () {
  $('#div_tree').jstree(true).search($('#in_treeSearch').val());
});

$('#in_searchScenario').keyup(function () {
  var search = $(this).value();
  if(search == ''){
    $('.panel-collapse.in').closest('.panel').find('.accordion-toggle').click()
    $('.scenarioDisplayCard').show();
    $('.scenarioListContainer').packery();
    return;
  }
  $('.panel-collapse:not(.in)').closest('.panel').find('.accordion-toggle').click()
  $('.scenarioDisplayCard').hide();
  $('.scenarioDisplayCard .name').each(function(){
    var text = $(this).text().toLowerCase();
    if(text.indexOf(search.toLowerCase()) >= 0){
      $(this)
      $(this).closest('.scenarioDisplayCard').show();
    }
  });
  $('.scenarioListContainer').packery();
});
$('#bt_chooseIcon').on('click', function () {
  chooseIcon(function (_icon) {
    $('.scenarioAttr[data-l1key=display][data-l2key=icon]').empty().append(_icon);
  });
});

$('.scenarioAttr[data-l1key=group]').autocomplete({
  source: function (request, response, url) {
    $.ajax({
      type: 'POST',
      url: 'core/ajax/scenario.ajax.php',
      data: {
        action: 'autoCompleteGroup',
        term: request.term
      },
      dataType: 'json',
      global: false,
      error: function (request, status, error) {
        handleAjaxError(request, status, error);
      },
      success: function (data) {
        if (data.state != 'ok') {
          $('#div_alert').showAlert({message: data.result, level: 'danger'});
          return;
        }
        response(data.result);
      }
    });
  },
  minLength: 1,
});

$("#bt_changeAllScenarioState,#bt_changeAllScenarioState2").off('click').on('click', function () {
  var el = $(this);
  jeedom.config.save({
    configuration: {enableScenario: el.attr('data-state')},
    error: function (error) {
      $('#div_alert').showAlert({message: error.message, level: 'danger'});
    },
    success: function () {
      loadPage('index.php?v=d&p=scenario');
    }
  });
});

$("#bt_addScenario,#bt_addScenario2").off('click').on('click', function (event) {
  bootbox.prompt("Nom du scénario ?", function (result) {
    if (result !== null) {
      jeedom.scenario.save({
        scenario: {name: result},
        error: function (error) {
          $('#div_alert').showAlert({message: error.message, level: 'danger'});
        },
        success: function (data) {
          var vars = getUrlVars();
          var url = 'index.php?';
          for (var i in vars) {
            if (i != 'id' && i != 'saveSuccessFull' && i != 'removeSuccessFull') {
              url += i + '=' + vars[i].replace('#', '') + '&';
            }
          }
          url += 'id=' + data.id + '&saveSuccessFull=1';
          if(tab !== null){
            url += tab;
          }
          modifyWithoutSave = false;
          loadPage(url);
        }
      });
    }
  });
});

jwerty.key('ctrl+s/⌘+s', function (e) {
  e.preventDefault();
  saveScenario();
});

$("#bt_saveScenario,#bt_saveScenario2").off('click').on('click', function (event) {
  saveScenario();
});

$("#bt_delScenario,#bt_delScenario2").off('click').on('click', function (event) {
  $.hideAlert();
  bootbox.confirm('{{Etes-vous sûr de vouloir supprimer le scénario}} <span style="font-weight: bold ;">' + $('.scenarioAttr[data-l1key=name]').value() + '</span> ?', function (result) {
    if (result) {
      jeedom.scenario.remove({
        id: $('.scenarioAttr[data-l1key=id]').value(),
        error: function (error) {
          $('#div_alert').showAlert({message: error.message, level: 'danger'});
        },
        success: function () {
          modifyWithoutSave = false;
          loadPage('index.php?v=d&p=scenario');
        }
      });
    }
  });
});

$("#bt_testScenario,#bt_testScenario2").off('click').on('click', function (event) {
  $.hideAlert();
  var scenario_id = $('.scenarioAttr[data-l1key=id]').value();
  if(event.ctrlKey) {
    saveScenario(function(){
      jeedom.scenario.changeState({
        id: scenario_id,
        state: 'start',
        error: function (error) {
          $('#div_alert').showAlert({message: error.message, level: 'danger'});
        },
        success: function () {
          $('#div_alert').showAlert({message: '{{Lancement du scénario réussi}}', level: 'success'});
          $('#md_modal').dialog({title: "{{Log d'exécution du scénario}}"});
          $("#md_modal").load('index.php?v=d&modal=scenario.log.execution&scenario_id=' + scenario_id).dialog('open');
        }
      });
    });
  }else{
    jeedom.scenario.changeState({
      id: $('.scenarioAttr[data-l1key=id]').value(),
      state: 'start',
      error: function (error) {
        $('#div_alert').showAlert({message: error.message, level: 'danger'});
      },
      success: function () {
        $('#div_alert').showAlert({message: '{{Lancement du scénario réussi}}', level: 'success'});
      }
    });
  }
});

$("#bt_copyScenario").off('click').on('click', function () {
  bootbox.prompt("Nom du scénario ?", function (result) {
    if (result !== null) {
      jeedom.scenario.copy({
        id: $('.scenarioAttr[data-l1key=id]').value(),
        name: result,
        error: function (error) {
          $('#div_alert').showAlert({message: error.message, level: 'danger'});
        },
        success: function (data) {
          loadPage('index.php?v=d&p=scenario&id=' + data.id);
        }
      });
    }
  });
});

$("#bt_stopScenario").off('click').on('click', function () {
  jeedom.scenario.changeState({
    id: $('.scenarioAttr[data-l1key=id]').value(),
    state: 'stop',
    error: function (error) {
      $('#div_alert').showAlert({message: error.message, level: 'danger'});
    },
    success: function () {
      $('#div_alert').showAlert({message: '{{Arrêt du scénario réussi}}', level: 'success'});
    }
  });
});

$('#bt_editJsonScenario').on('click',function(){
  $('#md_modal').dialog({title: "{{Edition texte scénarios}}"});
  $("#md_modal").load('index.php?v=d&modal=scenario.jsonEdit&id='+$('.scenarioAttr[data-l1key=id]').value()).dialog('open');
});

$('#bt_displayScenarioVariable,#bt_displayScenarioVariable2').off('click').on('click', function () {
  $('#md_modal').dialog({title: "{{Variables des scénarios}}"});
  $("#md_modal").load('index.php?v=d&modal=dataStore.management&type=scenario').dialog('open');
});

$('.bt_showExpressionTest').off('click').on('click', function () {
  $('#md_modal').dialog({title: "{{Testeur d'expression}}"});
  $("#md_modal").load('index.php?v=d&modal=expression.test').dialog('open');
});

$('.bt_showScenarioSummary').off('click').on('click', function () {
  $('#md_modal').dialog({title: "{{Résumé scénario}}"});
  $("#md_modal").load('index.php?v=d&modal=scenario.summary').dialog('open');
});

$('#in_addElementType').off('change').on('change',function(){
  $('.addElementTypeDescription').hide();
  $('.addElementTypeDescription.'+$(this).value()).show();
});

$('#bt_scenarioTab').on('click',function(){
  setTimeout(function(){
    setEditor();
    taAutosize();
    updateElseToggle();
  }, 50);
});

/*******************Element***********************/

$('#div_pageContainer').off('change','.subElementAttr[data-l1key=options][data-l2key=enable]').on('change','.subElementAttr[data-l1key=options][data-l2key=enable]',function(){
  var checkbox = $(this);
  var element = checkbox.closest('.element');
  if(checkbox.value() == 1){
    element.removeClass('disableElement');
  }else{
    element.addClass('disableElement');
  }
  var subElement =checkbox.closest('.element').find('.subElement:not(.noSortable)');
  if(checkbox.value() == 1){
    subElement.find('.expressions').removeClass('disableSubElement');
  }else{
    subElement.find('.expressions').addClass('disableSubElement');
  }
});

$('#div_pageContainer').off('change','.expressionAttr[data-l1key=options][data-l2key=enable]').on('change','.expressionAttr[data-l1key=options][data-l2key=enable]',function(){
  var checkbox = $(this);
  var element = checkbox.closest('.expression');
  if(checkbox.value() == 1){
    element.removeClass('disableSubElement');
  }else{
    element.addClass('disableSubElement');
  }
});

$('#div_pageContainer').off('click','.helpSelectCron').on('click','.helpSelectCron',function(){
  var el = $(this).closest('.schedule').find('.scenarioAttr[data-l1key=schedule]');
  jeedom.getCronSelectModal({},function (result) {
    el.value(result.value);
  });
});

$('#div_pageContainer').off('click','.bt_addScenarioElement').on( 'click','.bt_addScenarioElement', function (event) {
  var elementDiv = $(this).closest('.element');
  if(elementDiv.html() == undefined){
    elementDiv = $('#div_scenarioElement');
  }
  var expression = false;
  if ($(this).hasClass('fromSubElement')) {
    elementDiv = $(this).closest('.subElement').find('.expressions').eq(0);
    expression = true;
  }
  $('#md_addElement').modal('show');
  $("#bt_addElementSave").off('click').on('click', function (event) {
    if (expression) {
      elementDiv.append(addExpression({type: 'element', element: {type: $("#in_addElementType").value()}}));
    } else {
      $('#div_scenarioElement .span_noScenarioElement').remove();
      elementDiv.append(addElement({type: $("#in_addElementType").value()}));
    }
    setEditor();
    updateSortable();
    updateElseToggle();
    $('#md_addElement').modal('hide');
  });
});

$('#div_pageContainer').off('click','.bt_removeElement').on('click','.bt_removeElement',  function (event) {
  var button = $(this);
  if(event.ctrlKey) {
    if (button.closest('.expression').length != 0) {
      button.closest('.expression').remove();
    } else {
      button.closest('.element').remove();
    }
  }else{
    bootbox.confirm("Etes vous sur de vouloir supprimer cet élément ?", function (result) {
      if (result) {
        if (button.closest('.expression').length != 0) {
          button.closest('.expression').remove();
        } else {
          button.closest('.element').remove();
        }
      }
    });
  }
});

$('#div_pageContainer').off('click','.bt_addAction').on( 'click','.bt_addAction', function (event) {
  $(this).closest('.subElement').children('.expressions').append(addExpression({type: 'action'}));
  setAutocomplete();
  updateSortable();
});

$('#div_pageContainer').off('click','.bt_showElse').on( 'click','.bt_showElse', function (event) {
  if($(this).children('i').hasClass('fa-chevron-right')){
    $(this).children('i').removeClass('fa-chevron-right').addClass('fa-chevron-down');
    $(this).closest('.element').children('.subElementELSE').show();
  }else{
    if($(this).closest('.element').children('.subElementELSE').children('.expressions').children('.expression').length>0){
      $('#div_alert').showAlert({message:"{{Le bloc Sinon ne peut être supprimé s'il contient des éléments.}}", level: 'danger'})
      return;
    }
    $(this).children('i').removeClass('fa-chevron-down').addClass('fa-chevron-right');
    $(this).closest('.element').children('.subElementELSE').hide();
  }
});

$('#div_pageContainer').off('click','.bt_collapse').on( 'click','.bt_collapse', function (event) {
  if($(this).children('i').hasClass('fa-eye')){
    $(this).children('i').removeClass('fa-eye').addClass('fa-eye-slash');
    $(this).closest('.element').addClass('elementCollapse');
    $(this).attr('value',1);
  }else{
    $(this).children('i').addClass('fa-eye').removeClass('fa-eye-slash');
    $(this).closest('.element').removeClass('elementCollapse');
    $(this).attr('value',0);
    setEditor();
  }
});

$('#div_pageContainer').off('click','.bt_removeExpression').on('click','.bt_removeExpression',  function (event) {
  $(this).closest('.expression').remove();
  updateSortable();
});

$('#div_pageContainer').off('click','.bt_selectCmdExpression').on('click','.bt_selectCmdExpression',  function (event) {
  var el = $(this);
  var expression = $(this).closest('.expression');
  var type = 'info';
  if (expression.find('.expressionAttr[data-l1key=type]').value() == 'action') {
    type = 'action';
  }
  jeedom.cmd.getSelectModal({cmd: {type: type}}, function (result) {
    if (expression.find('.expressionAttr[data-l1key=type]').value() == 'action') {
      expression.find('.expressionAttr[data-l1key=expression]').value(result.human);
      jeedom.cmd.displayActionOption(expression.find('.expressionAttr[data-l1key=expression]').value(), '', function (html) {
        expression.find('.expressionOptions').html(html);
        taAutosize();
      });
    }
    if (expression.find('.expressionAttr[data-l1key=type]').value() == 'condition') {
      message = 'Aucun choix possible';
      if(result.cmd.subType == 'numeric'){
        message = '<div class="row">  ' +
        '<div class="col-md-12"> ' +
        '<form class="form-horizontal" onsubmit="return false;"> ' +
        '<div class="form-group"> ' +
        '<label class="col-xs-5 control-label" >'+result.human+' {{est}}</label>' +
        '             <div class="col-xs-3">' +
        '                <select class="conditionAttr form-control" data-l1key="operator">' +
        '                    <option value="==">{{égal}}</option>' +
        '                  <option value=">">{{supérieur}}</option>' +
        '                  <option value="<">{{inférieur}}</option>' +
        '                 <option value="!=">{{différent}}</option>' +
        '            </select>' +
        '       </div>' +
        '      <div class="col-xs-4">' +
        '         <input type="number" class="conditionAttr form-control" data-l1key="operande" />' +
        '    </div>' +
        '</div>' +
        '<div class="form-group"> ' +
        '<label class="col-xs-5 control-label" >{{Ensuite}}</label>' +
        '             <div class="col-xs-3">' +
        '                <select class="conditionAttr form-control" data-l1key="next">' +
        '                    <option value="">rien</option>' +
        '                  <option value="ET">{{et}}</option>' +
        '                  <option value="OU">{{ou}}</option>' +
        '            </select>' +
        '       </div>' +
        '</div>' +
        '</div> </div>' +
        '</form> </div>  </div>';
      }
      if(result.cmd.subType == 'string'){
        message = '<div class="row">  ' +
        '<div class="col-md-12"> ' +
        '<form class="form-horizontal" onsubmit="return false;"> ' +
        '<div class="form-group"> ' +
        '<label class="col-xs-5 control-label" >'+result.human+' {{est}}</label>' +
        '             <div class="col-xs-3">' +
        '                <select class="conditionAttr form-control" data-l1key="operator">' +
        '                    <option value="==">{{égale}}</option>' +
        '                  <option value="matches">{{contient}}</option>' +
        '                 <option value="!=">{{différent}}</option>' +
        '            </select>' +
        '       </div>' +
        '      <div class="col-xs-4">' +
        '         <input class="conditionAttr form-control" data-l1key="operande" />' +
        '    </div>' +
        '</div>' +
        '<div class="form-group"> ' +
        '<label class="col-xs-5 control-label" >{{Ensuite}}</label>' +
        '             <div class="col-xs-3">' +
        '                <select class="conditionAttr form-control" data-l1key="next">' +
        '                    <option value="">{{rien}}</option>' +
        '                  <option value="ET">{{et}}</option>' +
        '                  <option value="OU">{{ou}}</option>' +
        '            </select>' +
        '       </div>' +
        '</div>' +
        '</div> </div>' +
        '</form> </div>  </div>';
      }
      if(result.cmd.subType == 'binary'){
        message = '<div class="row">  ' +
        '<div class="col-md-12"> ' +
        '<form class="form-horizontal" onsubmit="return false;"> ' +
        '<div class="form-group"> ' +
        '<label class="col-xs-5 control-label" >'+result.human+' {{est}}</label>' +
        '            <div class="col-xs-7">' +
        '                 <input class="conditionAttr" data-l1key="operator" value="==" style="display : none;" />' +
        '                  <select class="conditionAttr form-control" data-l1key="operande">' +
        '                       <option value="1">{{Ouvert}}</option>' +
        '                       <option value="0">{{Fermé}}</option>' +
        '                       <option value="1">{{Allumé}}</option>' +
        '                       <option value="0">{{Eteint}}</option>' +
        '                       <option value="1">{{Déclenché}}</option>' +
        '                       <option value="0">{{Au repos}}</option>' +
        '                       </select>' +
        '                    </div>' +
        '                 </div>' +
        '<div class="form-group"> ' +
        '<label class="col-xs-5 control-label" >{{Ensuite}}</label>' +
        '             <div class="col-xs-3">' +
        '                <select class="conditionAttr form-control" data-l1key="next">' +
        '                  <option value="">{{rien}}</option>' +
        '                  <option value="ET">{{et}}</option>' +
        '                  <option value="OU">{{ou}}</option>' +
        '            </select>' +
        '       </div>' +
        '</div>' +
        '</div> </div>' +
        '</form> </div>  </div>';
      }
      
      bootbox.dialog({
        title: "{{Ajout d'un nouveau scénario}}",
        message: message,
        buttons: {
          "Ne rien mettre": {
            className: "btn-default",
            callback: function () {
              expression.find('.expressionAttr[data-l1key=expression]').atCaret('insert', result.human);
            }
          },
          success: {
            label: "Valider",
            className: "btn-primary",
            callback: function () {
              var condition = result.human;
              condition += ' ' + $('.conditionAttr[data-l1key=operator]').value();
              if(result.cmd.subType == 'string'){
                if($('.conditionAttr[data-l1key=operator]').value() == 'matches'){
                  condition += ' "/' + $('.conditionAttr[data-l1key=operande]').value()+'/"';
                }else{
                  condition += ' "' + $('.conditionAttr[data-l1key=operande]').value()+'"';
                }
              }else{
                condition += ' ' + $('.conditionAttr[data-l1key=operande]').value();
              }
              condition += ' ' + $('.conditionAttr[data-l1key=next]').value()+' ';
              expression.find('.expressionAttr[data-l1key=expression]').atCaret('insert', condition);
              if($('.conditionAttr[data-l1key=next]').value() != ''){
                el.click();
              }
            }
          },
        }
      });
    }
  });
});


$('#div_pageContainer').off('click','.bt_selectOtherActionExpression').on('click','.bt_selectOtherActionExpression',  function (event) {
  var expression = $(this).closest('.expression');
  jeedom.getSelectActionModal({scenario : true}, function (result) {
    expression.find('.expressionAttr[data-l1key=expression]').value(result.human);
    jeedom.cmd.displayActionOption(expression.find('.expressionAttr[data-l1key=expression]').value(), '', function (html) {
      expression.find('.expressionOptions').html(html);
      taAutosize();
    });
  });
});


$('#div_pageContainer').off('click','.bt_selectScenarioExpression').on('click','.bt_selectScenarioExpression',  function (event) {
  var expression = $(this).closest('.expression');
  jeedom.scenario.getSelectModal({}, function (result) {
    if (expression.find('.expressionAttr[data-l1key=type]').value() == 'action') {
      expression.find('.expressionAttr[data-l1key=expression]').value(result.human);
    }
    if (expression.find('.expressionAttr[data-l1key=type]').value() == 'condition') {
      expression.find('.expressionAttr[data-l1key=expression]').atCaret('insert', result.human);
    }
  });
});

$('#div_pageContainer').off('click','.bt_selectEqLogicExpression').on('click','.bt_selectEqLogicExpression',  function (event) {
  var expression = $(this).closest('.expression');
  jeedom.eqLogic.getSelectModal({}, function (result) {
    if (expression.find('.expressionAttr[data-l1key=type]').value() == 'action') {
      expression.find('.expressionAttr[data-l1key=expression]').value(result.human);
    }
    if (expression.find('.expressionAttr[data-l1key=type]').value() == 'condition') {
      expression.find('.expressionAttr[data-l1key=expression]').atCaret('insert', result.human);
    }
  });
});

$('#div_pageContainer').off('focusout','.expression .expressionAttr[data-l1key=expression]').on('focusout','.expression .expressionAttr[data-l1key=expression]',  function (event) {
  var el = $(this);
  if (el.closest('.expression').find('.expressionAttr[data-l1key=type]').value() == 'action') {
    var expression = el.closest('.expression').getValues('.expressionAttr');
    jeedom.cmd.displayActionOption(el.value(), init(expression[0].options), function (html) {
      el.closest('.expression').find('.expressionOptions').html(html);
      taAutosize();
    });
  }
});


/**************** Scheduler **********************/

$('.scenarioAttr[data-l1key=mode]').off('change').on('change', function () {
  $('#bt_addSchedule').removeClass('roundedRight');
  $('#bt_addTrigger').removeClass('roundedRight');
  if ($(this).value() == 'schedule' || $(this).value() == 'all') {
    $('.scheduleDisplay').show();
    $('#bt_addSchedule').show();
  } else {
    $('.scheduleDisplay').hide();
    $('#bt_addSchedule').hide();
    $('#bt_addTrigger').addClass('roundedRight');
  }
  if ($(this).value() == 'provoke' || $(this).value() == 'all') {
    $('.provokeDisplay').show();
    $('#bt_addTrigger').show();
  } else {
    $('.provokeDisplay').hide();
    $('#bt_addTrigger').hide();
    $('#bt_addSchedule').addClass('roundedRight');
  }
  if($(this).value() == 'all'){
    $('#bt_addSchedule').addClass('roundedRight');
  }
});

$('#bt_addTrigger').off('click').on('click', function () {
  addTrigger('');
});

$('#bt_addSchedule').off('click').on('click', function () {
  addSchedule('');
});

$('#div_pageContainer').off('click','.bt_removeTrigger').on('click','.bt_removeTrigger',  function (event) {
  $(this).closest('.trigger').remove();
});

$('#div_pageContainer').off('click','.bt_removeSchedule').on('click','.bt_removeSchedule',  function (event) {
  $(this).closest('.schedule').remove();
});

$('#div_pageContainer').off('click','.bt_selectTrigger').on('click','.bt_selectTrigger',  function (event) {
  var el = $(this);
  jeedom.cmd.getSelectModal({cmd: {type: 'info'}}, function (result) {
    el.closest('.trigger').find('.scenarioAttr[data-l1key=trigger]').value(result.human);
  });
});

$('#div_pageContainer').off('click','.bt_selectDataStoreTrigger').on( 'click','.bt_selectDataStoreTrigger', function (event) {
  var el = $(this);
  jeedom.dataStore.getSelectModal({cmd: {type: 'info'}}, function (result) {
    el.closest('.trigger').find('.scenarioAttr[data-l1key=trigger]').value(result.human);
  });
});

$('#div_pageContainer').off('mouseenter','.bt_sortable').on('mouseenter','.bt_sortable',  function () {
  var expressions = $(this).closest('.expressions');
  $("#div_scenarioElement").sortable({
    cursor: "move",
    items: ".sortable",
    opacity: 0.5,
    forcePlaceholderSize: true,
    forceHelperSize: true,
    placeholder: "sortable-placeholder",
    update: function (event, ui) {
      if (ui.item.findAtDepth('.element', 2).length == 1 && ui.item.parent().attr('id') == 'div_scenarioElement') {
        ui.item.replaceWith(ui.item.findAtDepth('.element', 2));
      }
      if (ui.item.hasClass('element') && ui.item.parent().attr('id') != 'div_scenarioElement') {
        ui.item.replaceWith(addExpression({type: 'element', element: {html: ui.item.clone().wrapAll("<div/>").parent().html()}}));
      }
      if (ui.item.hasClass('expression') && ui.item.parent().attr('id') == 'div_scenarioElement') {
        $("#div_scenarioElement").sortable("cancel");
      }
      if (ui.item.closest('.subElement').hasClass('noSortable')) {
        $("#div_scenarioElement").sortable("cancel");
      }
      updateSortable();
    },
    start: function (event, ui) {
      if (expressions.find('.sortable').length < 3) {
        expressions.find('.sortable.empty').show();
      }
    },
  });
  $("#div_scenarioElement").sortable("enable");
});

$('#div_pageContainer').off('mouseout','.bt_sortable').on('mouseout','.bt_sortable',  function () {
  $("#div_scenarioElement").sortable("disable");
  
});

$('#bt_graphScenario').off('click').on('click', function () {
  $('#md_modal').dialog({title: "{{Graphique de lien(s)}}"});
  $("#md_modal").load('index.php?v=d&modal=graph.link&filter_type=scenario&filter_id='+$('.scenarioAttr[data-l1key=id]').value()).dialog('open');
});

$('#bt_logScenario').off('click').on('click', function () {
  $('#md_modal').dialog({title: "{{Log d'exécution du scénario}}"});
  $("#md_modal").load('index.php?v=d&modal=scenario.log.execution&scenario_id=' + $('.scenarioAttr[data-l1key=id]').value()).dialog('open');
});

$('#bt_exportScenario').off('click').on('click', function () {
  $('#md_modal').dialog({title: "{{Export du scénario}}"});
  $("#md_modal").load('index.php?v=d&modal=scenario.export&scenario_id=' + $('.scenarioAttr[data-l1key=id]').value()).dialog('open');
});

$('#bt_templateScenario').off('click').on('click', function () {
  $('#md_modal').dialog({title: "{{Template de scénario}}"});
  $("#md_modal").load('index.php?v=d&modal=scenario.template&scenario_id=' + $('.scenarioAttr[data-l1key=id]').value()).dialog('open');
});

/**************** Initialisation **********************/

$('#div_pageContainer').off('change','.scenarioAttr').on('change','.scenarioAttr',  function () {
  modifyWithoutSave = true;
});

$('#div_pageContainer').off('change','.expressionAttr').on('change','.expressionAttr',  function () {
  modifyWithoutSave = true;
});

$('#div_pageContainer').off('change','.elementAttr').on('change','.elementAttr',  function () {
  modifyWithoutSave = true;
});

$('#div_pageContainer').off('change','.subElementAttr').on('change', '.subElementAttr', function () {
  modifyWithoutSave = true;
});

if (is_numeric(getUrlVars('id'))) {
  if ($('.scenarioDisplayCard[data-scenario_id=' + getUrlVars('id') + ']').length != 0) {
    $('.scenarioDisplayCard[data-scenario_id=' + getUrlVars('id') + ']').click();
  }
}

function updateSortable() {
  $('.element').removeClass('sortable');
  $('#div_scenarioElement > .element').addClass('sortable');
  $('.subElement .expressions').each(function () {
    if ($(this).children('.sortable:not(.empty)').length > 0) {
      $(this).children('.sortable.empty').hide();
    } else {
      $(this).children('.sortable.empty').show();
    }
  });
}

function updateElseToggle() {
  $('.subElementELSE').each(function () {
    if(!$(this).closest('.element').children('.subElementTHEN').find('.bt_showElse:first i').hasClass('fa-chevron-right')){
      if($(this).children('.expressions').children('.expression').length == 0){
        $(this).closest('.element').children('.subElementTHEN').find('.bt_showElse:first').trigger('click');
      }
    }
  });
}

function updateElementCollpase() {
  $('.bt_collapse').each(function () {
    if($(this).value() == 0){
      $(this).closest('.element').removeClass('elementCollapse');
    }else{
      $(this).closest('.element').addClass('elementCollapse');
    }
  });
}

function setEditor() {
  $('.expressionAttr[data-l1key=type][value=code]').each(function () {
    var expression = $(this).closest('.expression');
    var code = expression.find('.expressionAttr[data-l1key=expression]');
    if (code.attr('id') == undefined && code.is(':visible')) {
      code.uniqueId();
      var id = code.attr('id');
      setTimeout(function () {
        editor[id] = CodeMirror.fromTextArea(document.getElementById(id), {
          lineNumbers: true,
          lineWrapping: true,
          mode: 'text/x-php',
          matchBrackets: true,
          viewportMargin : Infinity
        });
      }, 1);
    }
  });
}

function setAutocomplete() {
  $('.expression').each(function () {
    if ($(this).find('.expressionAttr[data-l1key=type]').value() == 'condition') {
      $(this).find('.expressionAttr[data-l1key=expression]').sew({values: autoCompleteCondition, token: '[ |#]'});
    }
    if ($(this).find('.expressionAttr[data-l1key=type]').value() == 'action') {
      $(this).find('.expressionAttr[data-l1key=expression]').autocomplete({
        source: autoCompleteAction,
        close: function (event, ui) {
          $(this).trigger('focusout');
        }
      });
    }
  });
}

function printScenario(_id) {
  $.showLoading();
  jeedom.scenario.update[_id] =function(_options){
    if(_options.scenario_id =! $('#div_pageContainer').getValues('.scenarioAttr')[0]['id']){
      return;
    }
    switch(_options.state){
      case 'error' :
      $('#bt_stopScenario').hide();
      $('#span_ongoing').text('{{Erreur}}');
      $('#span_ongoing').removeClass('label-info label-danger label-success label-info').addClass('label-warning');
      break;
      case 'on' :
      $('#bt_stopScenario').show();
      $('#span_ongoing').text('{{Actif}}');
      $('#span_ongoing').removeClass('label-info label-danger label-warning label-info').addClass('label-success');
      break;
      case 'starting' :
      $('#bt_stopScenario').show();
      $('#span_ongoing').text('{{Démarrage}}');
      $('#span_ongoing').removeClass('label-success label-danger label-warning label-info').addClass('label-warning');
      case 'in progress' :
      $('#bt_stopScenario').show();
      $('#span_ongoing').text('{{En cours}}');
      $('#span_ongoing').removeClass('label-success label-danger label-warning label-info').addClass('label-info');
      break;
      case 'stop' :
      $('#bt_stopScenario').hide();
      $('#span_ongoing').text('{{Arrêté}}');
      $('#span_ongoing').removeClass('label-info label-success label-warning label-info').addClass('label-danger');
      break;
    }
  }
  jeedom.scenario.get({
    id: _id,
    error: function (error) {
      $('#div_alert').showAlert({message: error.message, level: 'danger'});
    },
    success: function (data) {
      pColor = 0;
      $('.scenarioAttr').value('');
      if(data.name){
        document.title = data.name +' - Jeedom';
      }
      $('.scenarioAttr[data-l1key=object_id] option:first').attr('selected',true);
      $('.scenarioAttr[data-l1key=object_id]').val('');
      $('#div_pageContainer').setValues(data, '.scenarioAttr');
      data.lastLaunch = (data.lastLaunch == null) ? '{{Jamais}}' : data.lastLaunch;
      $('#span_lastLaunch').text(data.lastLaunch);
      
      $('#div_scenarioElement').empty();
      $('.provokeMode').empty();
      $('.scheduleMode').empty();
      $('.scenarioAttr[data-l1key=mode]').trigger('change');
      for (var i in data.schedules) {
        $('#div_schedules').schedule.display(data.schedules[i]);
      }
      jeedom.scenario.update[_id](data);
      if (data.isActive != 1) {
        $('#in_ongoing').text('{{Inactif}}');
        $('#in_ongoing').removeClass('label-danger');
        $('#in_ongoing').removeClass('label-success');
      }
      if ($.isArray(data.trigger)) {
        for (var i in data.trigger) {
          if (data.trigger[i] != '' && data.trigger[i] != null) {
            addTrigger(data.trigger[i]);
          }
        }
      } else {
        if (data.trigger != '' && data.trigger != null) {
          addTrigger(data.trigger);
        }
      }
      if ($.isArray(data.schedule)) {
        for (var i in data.schedule) {
          if (data.schedule[i] != '' && data.schedule[i] != null) {
            addSchedule(data.schedule[i]);
          }
        }
      } else {
        if (data.schedule != '' && data.schedule != null) {
          addSchedule(data.schedule);
        }
      }
      if(data.elements.length == 0){
        $('#div_scenarioElement').append('<center class="span_noScenarioElement"><span>Pour constituer votre scénario veuillez ajouter des blocs</span></center>')
      }
      actionOptions = []
      var elements = '';
      for (var i in data.elements) {
        elements += addElement(data.elements[i]);
      }
      $('#div_scenarioElement').append(elements);
      $('.subElementAttr[data-l1key=options][data-l2key=enable]').trigger('change');
      $('.expressionAttr[data-l1key=options][data-l2key=enable]').trigger('change');
      jeedom.cmd.displayActionsOption({
        params : actionOptions,
        async : false,
        error: function (error) {
          $('#div_alert').showAlert({message: error.message, level: 'danger'});
        },
        success : function(data){
          $.showLoading();
          for(var i in data){
            $('#'+data[i].id).append(data[i].html.html);
          }
          $.hideLoading();
          taAutosize();
        }
      });
      $('#div_editScenario').show();
      updateSortable();
      setAutocomplete();
      updateElementCollpase();
      updateElseToggle();
      taAutosize();
      setTimeout(function () {
        setEditor();
      }, 100);
      modifyWithoutSave = false;
      setTimeout(function () {
        modifyWithoutSave = false;
      }, 1000);
    }
  });
}

function saveScenario(_callback) {
  $.hideAlert();
  var scenario = $('#div_pageContainer').getValues('.scenarioAttr')[0];
  if(typeof scenario.trigger == 'undefined'){
    scenario.trigger = '';
  }
  if(typeof scenario.schedule == 'undefined'){
    scenario.schedule = '';
  }
  var elements = [];
  $('#div_scenarioElement').children('.element').each(function () {
    elements.push(getElement($(this)));
  });
  scenario.elements = elements;
  jeedom.scenario.save({
    scenario: scenario,
    error: function (error) {
      $('#div_alert').showAlert({message: error.message, level: 'danger'});
    },
    success: function (data) {
      modifyWithoutSave = false;
      url = 'index.php?v=d&p=scenario&id=' + data.id + '&saveSuccessFull=1';
      if (document.location.toString().match('#')) {
        url += '#' + document.location.toString().split('#')[1];
      }
      loadPage(url);
      if(typeof _callback == 'function'){
        _callback();
      }
    }
  });
}

function addTrigger(_trigger) {
  var div = '<div class="form-group trigger">';
  div += '<label class="col-xs-3 control-label">{{Evénement}}</label>';
  div += '<div class="col-xs-9">';
  div += '<div class="input-group">';
  div += '<input class="scenarioAttr input-sm form-control roundedLeft" data-l1key="trigger" value="' + _trigger.replace(/"/g,'&quot;') + '" >';
  div += '<span class="input-group-btn">';
  div += '<a class="btn btn-default btn-sm cursor bt_selectTrigger" title="{{Choisir une commande}}"><i class="fas fa-list-alt"></i></a>';
  div += '<a class="btn btn-default btn-sm cursor bt_selectDataStoreTrigger" title="{{Choisir une variable}}"><i class="fas fa-calculator"></i></a>';
  div += '<a class="btn btn-default btn-sm cursor bt_removeTrigger roundedRight"><i class="fas fa-minus-circle"></i></a>';
  div += '</span>';
  div += '</div>';
  div += '</div>';
  div += '</div>';
  $('.provokeMode').append(div);
}

function addSchedule(_schedule) {
  var div = '<div class="form-group schedule">';
  div += '<label class="col-xs-3 control-label">{{Programmation}}</label>';
  div += '<div class="col-xs-9">';
  div += '<div class="input-group">';
  div += '<input class="scenarioAttr input-sm form-control roundedLeft" data-l1key="schedule" value="' + _schedule.replace(/"/g,'&quot;') + '">';
  div += '<span class="input-group-btn">';
  div += '<a class="btn btn-default btn-sm cursor helpSelectCron"><i class="fas fa-question-circle"></i></a>';
  div += '<a class="btn btn-default btn-sm cursor bt_removeSchedule roundedRight"><i class="fas fa-minus-circle"></i></a>';
  div += '</span>';
  div += '</div>';
  div += '</div>';
  div += '</div>';
  $('.scheduleMode').append(div);
}

function addExpression(_expression) {
  if (!isset(_expression.type) || _expression.type == '') {
    return '';
  }
  var sortable = 'sortable';
  if (_expression.type == 'condition') {
    sortable = 'noSortable';
  }
  var retour = '<div class="expression ' + sortable + ' col-xs-12" >';
  retour += '<input class="expressionAttr" data-l1key="id" style="display : none;" value="' + init(_expression.id) + '"/>';
  retour += '<input class="expressionAttr" data-l1key="scenarioSubElement_id" style="display : none;" value="' + init(_expression.scenarioSubElement_id) + '"/>';
  retour += '<input class="expressionAttr" data-l1key="type" style="display : none;" value="' + init(_expression.type) + '"/>';
  switch (_expression.type) {
    case 'condition' :
    if (isset(_expression.expression)) {
      _expression.expression = _expression.expression.replace(/"/g, '&quot;');
    }
    retour += '<div class="input-group input-group-sm" >';
    retour += '<textarea class="expressionAttr form-control roundedLeft" data-l1key="expression" rows="1" style="resize:vertical;">' + init(_expression.expression) + '</textarea>';
    retour += '<span class="input-group-btn">';
    retour += '<button type="button" class="btn btn-default cursor bt_selectCmdExpression tooltips"  title="{{Rechercher une commande}}"><i class="fas fa-list-alt"></i></button>';
    retour += '<button type="button" class="btn btn-default cursor bt_selectScenarioExpression tooltips"  title="{{Rechercher un scenario}}"><i class="fas fa-history"></i></button>';
    retour += '<button type="button" class="btn btn-default cursor bt_selectEqLogicExpression tooltips roundedRight"  title="{{Rechercher d\'un équipement}}"><i class="fas fa-cube"></i></button>';
    retour += '</span>';
    retour += '</div>';
    
    break;
    case 'element' :
    retour += '<div class="col-xs-12" >';
    if (isset(_expression.element) && isset(_expression.element.html)) {
      retour += _expression.element.html;
    } else {
      var element = addElement(_expression.element, true);
      if ($.trim(element) == '') {
        return '';
      }
      retour += element;
    }
    retour += '</div>';
    break;
    case 'action' :
    retour += '<div class="col-xs-1" >';
    retour += '<i class="fas fa-arrows-alt-v cursor bt_sortable" ></i>';
    if (!isset(_expression.options) || !isset(_expression.options.enable) || _expression.options.enable == 1) {
      retour += '<input type="checkbox" class="expressionAttr" data-l1key="options" data-l2key="enable" checked  title="{{Décocher pour désactiver l\'action}}"/>';
    } else {
      retour += '<input type="checkbox" class="expressionAttr" data-l1key="options" data-l2key="enable"  title="{{Décocher pour désactiver l\'action}}"/>';
    }
    if (!isset(_expression.options) || !isset(_expression.options.background) || _expression.options.background == 0) {
      retour += '<input type="checkbox" class="expressionAttr" data-l1key="options" data-l2key="background"  title="{{Cocher pour que la commande s\'exécute en parallèle des autres actions}}"/>';
    } else {
      retour += '<input type="checkbox" class="expressionAttr" data-l1key="options" data-l2key="background" checked  title="{{Cocher pour que la commande s\'exécute en parallèle des autres actions}}"/>';
    }
    
    retour += '</div>';
    retour += '<div class="col-xs-4" ><div class="input-group input-group-sm">';
    retour += '<span class="input-group-btn">';
    retour += '<button class="btn btn-default bt_removeExpression roundedLeft" type="button" title="{{Supprimer l\'action}}"><i class="fas fa-minus-circle"></i></button>';
    retour += '</span>';
    retour += '<input class="expressionAttr form-control" data-l1key="expression" value="' + init(_expression.expression).replace(/"/g,'&quot;') + '"/>';
    retour += '<span class="input-group-btn">';
    retour += '<button class="btn btn-default bt_selectOtherActionExpression" type="button" title="{{Sélectionner un mot-clé}}"><i class="fas fa-tasks"></i></button>';
    retour += '<button class="btn btn-default bt_selectCmdExpression roundedRight" type="button" title="{{Sélectionner la commande}}"><i class="fas fa-list-alt"></i></button>';
    retour += '</span>';
    retour += '</div></div>';
    var actionOption_id = uniqId();
    retour += '<div class="col-xs-7 expressionOptions"  id="'+actionOption_id+'">';
    retour += '</div>';
    actionOptions.push({
      expression : init(_expression.expression, ''),
      options : _expression.options,
      id : actionOption_id
    });
    break;
    case 'code' :
    retour += '<div class="col-xs-12">';
    retour += '<textarea class="expressionAttr form-control" data-l1key="expression">' + init(_expression.expression) + '</textarea>';
    retour += '</div>';
    break;
    case 'comment' :
    retour += '<textarea class="expressionAttr form-control" data-l1key="expression">' + init(_expression.expression) + '</textarea>';
    break;
  }
  retour += '</div>';
  return retour;
}

$('#div_pageContainer').on('click','.subElementAttr[data-l1key=options][data-l2key=allowRepeatCondition]',function(){
  if($(this).attr('value') == 0){
    $(this).attr('value',1);
    $(this).html('<span><i class="fas fa-ban text-danger"></i></span>');
  }else{
    $(this).attr('value',0);
    $(this).html('<span><i class="fas fa-refresh"></span>');
  }
});

function addSubElement(_subElement, _pColor) {
  if (!isset(_subElement.type) || _subElement.type == '') {
    return '';
  }
  if (!isset(_subElement.options)) {
    _subElement.options = {};
  }
  var noSortable = '';
  if (_subElement.type == 'if' || _subElement.type == 'for' || _subElement.type == 'code') {
    noSortable = 'noSortable';
  }
  
  blocClass = '';
  switch (_subElement.type) {
    case 'if':
    blocClass = 'subElementIF';
    break;
    case 'then':
    blocClass = 'subElementTHEN';
    break;
    case 'else':
    blocClass = 'subElementELSE';
    break;
    case 'for':
    blocClass = 'subElementFOR';
    break;
    case 'in':
    blocClass = 'subElementIN';
    break;
    case 'at':
    blocClass = 'subElementAT';
    break;
    case 'do':
    blocClass = 'subElementDO';
    break;
    case 'code':
    blocClass = 'subElementCODE';
    break;
    case 'comment':
    blocClass = 'subElementCOMMENT';
    break;
    case 'action':
    blocClass = 'subElementACTION';
    break;
  }
  var retour = '<div class="subElement ' + blocClass + ' ' + noSortable + '">';
  retour += '<input class="subElementAttr" data-l1key="id" style="display : none;" value="' + init(_subElement.id) + '"/>';
  retour += '<input class="subElementAttr" data-l1key="scenarioElement_id" style="display : none;" value="' + init(_subElement.scenarioElement_id) + '"/>';
  retour += '<input class="subElementAttr" data-l1key="type" style="display : none;" value="' + init(_subElement.type) + '"/>';
  switch (_subElement.type) {
    case 'if' :
    retour += '<input class="subElementAttr" data-l1key="subtype" style="display : none;" value="condition"/>';
    retour += '<div>';
    retour += '<i class="bt_sortable fas fa-arrows-alt-v pull-left cursor" ></i>';
    if(!isset(_subElement.options) || !isset(_subElement.options.collapse) || _subElement.options.collapse == 0){
      retour += '<a class="bt_collapse cursor subElementAttr tooltips" data-l1key="options" data-l2key="collapse" value="0"><i class="far fa-eye"></i></a>';
    }else{
      retour += '<a class="bt_collapse cursor subElementAttr tooltips" data-l1key="options" data-l2key="collapse" value="1"><i class="far fa-eye-slash"></i></a>';
    }
    if(!isset(_subElement.options) || !isset(_subElement.options.enable) || _subElement.options.enable == 1){
      retour += '<input type="checkbox" class="subElementAttr" data-l1key="options" data-l2key="enable" checked title="Décocher pour désactiver l\'élément" />';
    }else{
      retour += '<input type="checkbox" class="subElementAttr" data-l1key="options" data-l2key="enable" title="Décocher pour désactiver l\'élément" />';
    }
    retour += '</div>';
    retour += '<div >';
    retour += '<legend >{{SI}}';
    retour += '</legend>';
    retour += '</div>';
    
    retour += '<div >';
    if(!isset(_subElement.options) || !isset(_subElement.options.allowRepeatCondition) || _subElement.options.allowRepeatCondition == 0){
      retour += '<a class="bt_repeat cursor subElementAttr tooltips" title="{{Autoriser ou non la répétition des actions si l\'évaluation de la condition est la même que la précédente}}" data-l1key="options" data-l2key="allowRepeatCondition" value="0"><span><i class="fas fa-refresh"></i></span></a>';
    }else{
      retour += '<a class="bt_repeat cursor subElementAttr tooltips" title="{{Autoriser ou non la répétition des actions si l\'évaluation de la condition est la même que la précédente}}" data-l1key="options" data-l2key="allowRepeatCondition" value="1"><span><i class="fas fa-ban text-danger"></i></span></a>';
    }
    retour += '</div>';
    
    retour += '<div class="expressions" >';
    var expression = {type: 'condition'};
    if (isset(_subElement.expressions) && isset(_subElement.expressions[0])) {
      expression = _subElement.expressions[0];
    }
    retour += addExpression(expression);
    retour += '  </div>';
    retour += '  <div ><i class="fas fa-minus-circle pull-right cursor bt_removeElement" ></i></div>';
    break;
    
    case 'then' :
    retour += '<input class="subElementAttr" data-l1key="subtype" style="display : none;" value="action"/>';
    retour += '<div class="subElementFields">';
    retour += '<legend >{{ALORS}}</legend>';
    retour += '<div class="input-group">';
    retour += '<button class="bt_showElse btn btn-xs btn-default roundedLeft" type="button" data-toggle="dropdown" title="{{Afficher/masquer le bloc Sinon}}" aria-haspopup="true" aria-expanded="true">';
    retour += '<i class="fas fa-chevron-down"></i>';
    retour += '</button>';
    retour += '<span class="input-group-btn">';
    retour += '<div class="dropdown" >';
    retour += '<button class="btn btn-sm btn-default dropdown-toggle roundedRight" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">';
    retour += '<i class="fas fa-plus-circle"></i> {{Ajouter}}';
    retour += '<span class="caret"></span>';
    retour += '</button>';
    retour += '<ul class="dropdown-menu">';
    retour += '<li><a class="bt_addScenarioElement fromSubElement tootlips" title="{{Permet d\'ajouter des éléments fonctionnels essentiels pour créer vos scénarios (Ex: SI/ALORS….)}}">{{Bloc}}</a></li>';
    retour += '<li><a class="bt_addAction">{{Action}}</a></li>';
    retour += '</ul>';
    retour += '</div>';
    retour += '</span>';
    retour += '</div>';
    retour += '</div>';
    retour += '<div class="expressions ' + 'scBlocColor' + _pColor + '">';
    retour += '<div class="sortable empty" ></div>';
    if (isset(_subElement.expressions)) {
      for (var k in _subElement.expressions) {
        retour += addExpression(_subElement.expressions[k]);
      }
    }
    retour += '</div>';
    break;
    
    case 'else' :
    retour += '<input class="subElementAttr subElementElse" data-l1key="subtype" style="display : none;" value="action"/>';
    retour += '<div class="subElementFields">';
    retour += '<legend >{{SINON}}</legend>';
    retour += '<div class="dropdown">';
    retour += '<button class="btn btn-xs btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">';
    retour += '<i class="fas fa-plus-circle"></i> Ajouter';
    retour += '<span class="caret"></span>';
    retour += '</button>';
    retour += '<ul class="dropdown-menu">';
    retour += '<li><a class="bt_addScenarioElement fromSubElement tootlips" title="{{Permet d\'ajouter des éléments fonctionnels essentiels pour créer vos scénarios (ex. : SI/ALORS….)}}">{{Bloc}}</a></li>';
    retour += '<li><a class="bt_addAction">{{Action}}</a></li>';
    retour += '</ul>';
    retour += '</div>';
    retour += '</div>';
    retour += '<div class="expressions ' + 'scBlocColor' + _pColor + '">';
    retour += '<div class="sortable empty" ></div>';
    if (isset(_subElement.expressions)) {
      for (var k in _subElement.expressions) {
        retour += addExpression(_subElement.expressions[k]);
      }
    }
    retour += '</div>';
    break;
    
    case 'for' :
    retour += '<input class="subElementAttr" data-l1key="subtype" style="display : none;" value="condition"/>';
    retour += '<div>';
    retour += '<i class="bt_sortable fas fa-arrows-alt-v pull-left cursor"></i>';
    if(!isset(_subElement.options) || !isset(_subElement.options.collapse) || _subElement.options.collapse == 0){
      retour += '<a class="bt_collapse cursor subElementAttr tooltips" data-l1key="options" data-l2key="collapse" value="0"><i class="far fa-eye"></i></a>';
    }else{
      retour += '<a class="bt_collapse cursor subElementAttr tooltips" data-l1key="options" data-l2key="collapse" value="1"><i class="far fa-eye-slash"></i></a>';
    }
    if(!isset(_subElement.options) || !isset(_subElement.options.enable) || _subElement.options.enable == 1){
      retour += '<input type="checkbox" class="subElementAttr" data-l1key="options" data-l2key="enable" checked title="{{Décocher pour désactiver l\'élément}}" />';
    }else{
      retour += '<input type="checkbox" class="subElementAttr" data-l1key="options" data-l2key="enable" title="{{Décocher pour désactiver l\'élément}}" />';
    }
    retour += '</div>';
    retour += '<div>';
    retour += '<legend >{{DE 1 A}}</legend>';
    retour += '</div>';
    retour += '<div class="expressions" >';
    var expression = {type: 'condition'};
    if (isset(_subElement.expressions) && isset(_subElement.expressions[0])) {
      expression = _subElement.expressions[0];
    }
    retour += addExpression(expression);
    retour += '</div>';
    retour += '<div><i class="fas fa-minus-circle pull-right cursor bt_removeElement" ></i></div>';
    break;
    
    case 'in' :
    retour += '<input class="subElementAttr" data-l1key="subtype" style="display : none;" value="condition"/>';
    retour += '<div>';
    retour += '<i class="bt_sortable fas fa-arrows-alt-v pull-left cursor"></i>';
    if(!isset(_subElement.options) || !isset(_subElement.options.collapse) || _subElement.options.collapse == 0){
      retour += '<a class="bt_collapse cursor subElementAttr tooltips" data-l1key="options" data-l2key="collapse" value="0"><i class="far fa-eye"></i></a>';
    }else{
      retour += '<a class="bt_collapse cursor subElementAttr tooltips" data-l1key="options" data-l2key="collapse" value="1"><i class="far fa-eye-slash"></i></a>';
    }
    if(!isset(_subElement.options) || !isset(_subElement.options.enable) || _subElement.options.enable == 1){
      retour += '<input type="checkbox" class="subElementAttr" data-l1key="options" data-l2key="enable" checked title="{{Décocher pour désactiver l\'élément}}" />';
    }else{
      retour += '<input type="checkbox" class="subElementAttr" data-l1key="options" data-l2key="enable" title="{{Décocher pour désactiver l\'élément}}" />';
    }
    retour += '</div>';
    retour += '<div>';
    retour += '<legend title="Action DANS x minutes">{{DANS}}</legend>';
    retour += '</div>';
    retour += '<div class="expressions" >';
    var expression = {type: 'condition'};
    if (isset(_subElement.expressions) && isset(_subElement.expressions[0])) {
      expression = _subElement.expressions[0];
    }
    retour += addExpression(expression);
    retour += '</div>';
    retour += '<div ><i class="fas fa-minus-circle pull-right cursor bt_removeElement" ></i></div>';
    break;
    
    case 'at' :
    retour += '<input class="subElementAttr" data-l1key="subtype" style="display : none;" value="condition"/>';
    retour += '<div>';
    retour += '<i class="bt_sortable fas fa-arrows-alt-v pull-left cursor"></i>';
    if(!isset(_subElement.options) || !isset(_subElement.options.collapse) || _subElement.options.collapse == 0){
      retour += '<a class="bt_collapse cursor subElementAttr tooltips" data-l1key="options" data-l2key="collapse" value="0"><i class="far fa-eye"></i></a>';
    }else{
      retour += '<a class="bt_collapse cursor subElementAttr tooltips" data-l1key="options" data-l2key="collapse" value="1"><i class="far fa-eye-slash"></i></a>';
    }
    if(!isset(_subElement.options) || !isset(_subElement.options.enable) || _subElement.options.enable == 1){
      retour += '<input type="checkbox" class="subElementAttr" data-l1key="options" data-l2key="enable" checked title="{{Décocher pour désactiver l\'élément}}" />';
    }else{
      retour += '<input type="checkbox" class="subElementAttr" data-l1key="options" data-l2key="enable" title="{{Décocher pour désactiver l\'élément}}" />';
    }
    retour += '</div>';
    retour += '<div>';
    retour += '<legend >{{A (Hmm)}}</legend>';
    retour += '</div>';
    retour += '<div class="expressions" >';
    var expression = {type: 'condition'};
    if (isset(_subElement.expressions) && isset(_subElement.expressions[0])) {
      expression = _subElement.expressions[0];
    }
    retour += addExpression(expression);
    retour += '</div>';
    retour += '<div ><i class="fas fa-minus-circle pull-right cursor bt_removeElement" ></i></div>';
    break;
    
    case 'do' :
    retour += '<input class="subElementAttr" data-l1key="subtype" style="display : none;" value="action"/>';
    retour += '<div class="subElementFields">';
    retour += '<legend >{{FAIRE}}</legend>';
    retour += '<div class="dropdown">';
    retour += '<button class="btn btn-xs btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">';
    retour += '<i class="fas fa-plus-circle"></i> Ajouter';
    retour += '<span class="caret"></span>';
    retour += '</button>';
    retour += '<ul class="dropdown-menu">';
    retour += '<li><a class="bt_addScenarioElement fromSubElement tootlips" title="{{Permet d\'ajouter des éléments fonctionnels essentiels pour créer vos scénarios (ex. : SI/ALORS….)}}">{{Bloc}}</a></li>';
    retour += '<li><a class="bt_addAction">{{Action}}</a></li>';
    retour += '</ul>';
    retour += '</div>';
    retour += '</div>';
    retour += '<div class="expressions ' + 'scBlocColor' + _pColor + '">';
    retour += '<div class="sortable empty" ></div>';
    if (isset(_subElement.expressions)) {
      for (var k in _subElement.expressions) {
        retour += addExpression(_subElement.expressions[k]);
      }
    }
    retour += '</div>';
    break;
    
    case 'code' :
    retour += '<input class="subElementAttr" data-l1key="subtype" style="display : none;" value="action"/>';
    retour += '<div>';
    retour += '<i class="bt_sortable fas fa-arrows-alt-v pull-left cursor"></i>';
    if(!isset(_subElement.options) || !isset(_subElement.options.collapse) || _subElement.options.collapse == 0){
      retour += '<a class="bt_collapse cursor subElementAttr tooltips" data-l1key="options" data-l2key="collapse" value="0"><i class="far fa-eye"></i></a>';
    }else{
      retour += '<a class="bt_collapse cursor subElementAttr tooltips" data-l1key="options" data-l2key="collapse" value="1"><i class="far fa-eye-slash"></i></a>';
    }
    if(!isset(_subElement.options) || !isset(_subElement.options.enable) || _subElement.options.enable == 1){
      retour += '<input type="checkbox" class="subElementAttr" data-l1key="options" data-l2key="enable" checked title="{{Décocher pour désactiver l\'élément}}" />';
    }else{
      retour += '<input type="checkbox" class="subElementAttr" data-l1key="options" data-l2key="enable" title="{{Décocher pour désactiver l\'élément}}" />';
    }
    retour += '</div>';
    retour += '<div>';
    retour += '<legend >{{CODE}}</legend>';
    retour += '</div>';
    retour += '<div class="expressions ' + 'scBlocColor' + _pColor + '">';
    retour += '<div class="sortable empty" ></div>';
    var expression = {type: 'code'};
    if (isset(_subElement.expressions) && isset(_subElement.expressions[0])) {
      expression = _subElement.expressions[0];
    }
    retour += addExpression(expression);
    retour += '</div>';
    retour += '<div><i class="fas fa-minus-circle pull-right cursor bt_removeElement" ></i></div>';
    break;
    
    case 'comment' :
    retour += '<input class="subElementAttr" data-l1key="subtype" style="display : none;" value="comment"/>';
    retour += '<div>';
    retour += '<i class="bt_sortable fas fa-arrows-alt-v pull-left cursor"></i>';
    if(!isset(_subElement.options) || !isset(_subElement.options.collapse) || _subElement.options.collapse == 0){
      retour += '<a class="bt_collapse cursor subElementAttr tooltips" data-l1key="options" data-l2key="collapse" value="0"><i class="far fa-eye"></i></a>';
    }else{
      retour += '<a class="bt_collapse cursor subElementAttr tooltips" data-l1key="options" data-l2key="collapse" value="1"><i class="far fa-eye-slash"></i></a>';
    }
    retour += '</div>';
    retour += '<div>';
    retour += '<legend >{{COMMENTAIRE}}</legend>';
    retour += '</div>';
    retour += '<div class="expressions ' + 'scBlocColor' + _pColor + '">';
    retour += '<div class="sortable empty" ></div>';
    var expression = {type: 'comment'};
    if (isset(_subElement.expressions) && isset(_subElement.expressions[0])) {
      expression = _subElement.expressions[0];
    }
    retour += addExpression(expression);
    retour += '</div>';
    retour += '<div ><i class="fas fa-minus-circle pull-right cursor bt_removeElement" ></i></div>';
    break;
    
    case 'action' :
    retour += '<input class="subElementAttr" data-l1key="subtype" style="display : none;" value="action"/>';
    retour += '<div>';
    retour += '<i class="bt_sortable fas fa-arrows-alt-v pull-left cursor"></i>';
    if(!isset(_subElement.options) || !isset(_subElement.options.collapse) || _subElement.options.collapse == 0){
      retour += '<a class="bt_collapse cursor subElementAttr tooltips" data-l1key="options" data-l2key="collapse" value="0"><i class="far fa-eye"></i></a>';
    }else{
      retour += '<a class="bt_collapse cursor subElementAttr tooltips" data-l1key="options" data-l2key="collapse" value="1"><i class="far fa-eye-slash"></i></a>';
    }
    if(!isset(_subElement.options) || !isset(_subElement.options.enable) || _subElement.options.enable == 1){
      retour += '<input type="checkbox" class="subElementAttr" data-l1key="options" data-l2key="enable" checked title="{{Décocher pour désactiver l\'élément}}" />';
    }else{
      retour += '<input type="checkbox" class="subElementAttr" data-l1key="options" data-l2key="enable" title="{{Décocher pour désactiver l\'élément}}" />';
    }
    retour += '<legend class="legendHidden">ACTION</legend>';
    retour += '</div>';
    retour += '<div class="subElementFields">';
    retour += '<legend >{{ACTION}}</legend><br/>';
    retour += '<div class="dropdown">';
    retour += '<button class="btn btn-xs btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">';
    retour += ' <i class="fas fa-plus-circle"></i> Ajouter';
    retour += '<span class="caret"></span>';
    retour += '</button>';
    retour += '<ul class="dropdown-menu">';
    retour += '<li><a class="bt_addScenarioElement fromSubElement tootlips" title="{{Permet d\'ajouter des éléments fonctionnels essentiels pour créer vos scénarios (Ex: SI/ALORS….)}}">{{Bloc}}</a></li>';
    retour += '<li><a class="bt_addAction">{{Action}}</a></li>';
    retour += '</ul>';
    retour += '</div>';
    retour += '</div>';
    retour += '<div class="expressions ' + 'scBlocColor' + _pColor + '">';
    retour += '<div class="sortable empty" ></div>';
    if (isset(_subElement.expressions)) {
      for (var k in _subElement.expressions) {
        retour += addExpression(_subElement.expressions[k]);
      }
    }
    retour += '</div>';
    retour += '<div><i class="fas fa-minus-circle pull-right cursor bt_removeElement" ></i></div>';
    break;
  }
  retour += '</div>';
  return retour;
}


function addElement(_element) {
  if (!isset(_element)) {
    return;
  }
  if (!isset(_element.type) || _element.type == '') {
    return '';
  }
  
  pColor++;
  if (pColor > 8) {
    pColor = 0;
  }
  var color = pColor;
  var div = '<div class="element ' + 'scBlocColor' + color + '">';
  
  div += '<input class="elementAttr" data-l1key="id" style="display : none;" value="' + init(_element.id) + '"/>';
  div += '<input class="elementAttr" data-l1key="type" style="display : none;" value="' + init(_element.type) + '"/>';
  switch (_element.type) {
    case 'if' :
    if (isset(_element.subElements) && isset(_element.subElements)) {
      for (var j in _element.subElements) {
        div += addSubElement(_element.subElements[j], color);
      }
    } else {
      div += addSubElement({type: 'if'}, color);
      div += addSubElement({type: 'then'}, color);
      div += addSubElement({type: 'else'}, color);
    }
    break;
    case 'for' :
    if (isset(_element.subElements) && isset(_element.subElements)) {
      for (var j in _element.subElements) {
        div += addSubElement(_element.subElements[j], color);
      }
    } else {
      div += addSubElement({type: 'for'}, color);
      div += addSubElement({type: 'do'}, color);
    }
    break;
    case 'in' :
    if (isset(_element.subElements) && isset(_element.subElements)) {
      for (var j in _element.subElements) {
        div += addSubElement(_element.subElements[j], color);
      }
    } else {
      div += addSubElement({type: 'in'}, color);
      div += addSubElement({type: 'do'}, color);
    }
    break;
    case 'at' :
    if (isset(_element.subElements) && isset(_element.subElements)) {
      for (var j in _element.subElements) {
        div += addSubElement(_element.subElements[j], color);
      }
    } else {
      div += addSubElement({type: 'at'}, color);
      div += addSubElement({type: 'do'}, color);
    }
    break;
    case 'code' :
    if (isset(_element.subElements) && isset(_element.subElements)) {
      for (var j in _element.subElements) {
        div += addSubElement(_element.subElements[j], color);
      }
    } else {
      div += addSubElement({type: 'code'}, color);
    }
    break;
    case 'comment' :
    if (isset(_element.subElements) && isset(_element.subElements)) {
      for (var j in _element.subElements) {
        div += addSubElement(_element.subElements[j], color);
      }
    } else {
      div += addSubElement({type: 'comment'}, color);
    }
    break;
    case 'action' :
    if (isset(_element.subElements) && isset(_element.subElements)) {
      for (var j in _element.subElements) {
        div += addSubElement(_element.subElements[j], color);
      }
    } else {
      div += addSubElement({type: 'action'}, color);
    }
    break;
  }
  div += '</div>';
  return div;
}

function getElement(_element) {
  var element = _element.getValues('.elementAttr', 1);
  if (element.length == 0) {
    return;
  }
  element = element[0];
  element.subElements = [];
  
  _element.findAtDepth('.subElement', 2).each(function () {
    var subElement = $(this).getValues('.subElementAttr', 2);
    subElement = subElement[0];
    subElement.expressions = [];
    var expression_dom = $(this).children('.expressions');
    if (expression_dom.length == 0) {
      expression_dom = $(this).children('legend').findAtDepth('.expressions', 2);
    }
    expression_dom.children('.expression').each(function () {
      var expression = $(this).getValues('.expressionAttr', 3);
      expression = expression[0];
      if (expression.type == 'element') {
        expression.element = getElement($(this).findAtDepth('.element', 2));
      }
      if (subElement.type == 'code') {
        var id = $(this).find('.expressionAttr[data-l1key=expression]').attr('id');
        if (id != undefined && isset(editor[id])) {
          expression.expression = editor[id].getValue();
        }
      }
      subElement.expressions.push(expression);
      
    });
    element.subElements.push(subElement);
  });
  return element;
}
