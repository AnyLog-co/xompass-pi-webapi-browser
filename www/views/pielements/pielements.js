angular.module('app.pielements',['angularTreeview', 'ngclipboard','ngWebSocket'])
    .controller('PielementsCtrl', function ($scope, $http, socket) {
        $scope.log = "";


        $scope.saveSettings = function () {
            $http.post('/pielements', $scope.srvPiConfig).then(
                function (response) {
                    console.log(response);
                }, function (err) {
                    console.log(err);
                });
            $http.post('/devices', $scope.srvDConfig).then(
                function (response) {
                    console.log(response);
                }, function (err) {
                    console.log(err);
                });
        };

        $scope.setAttSubscription = function(attId, elementId, status){
            if(status == true){
                if(!$scope.srvPiConfig.subscribedAttributes)
                    $scope.srvPiConfig.subscribedAttributes = [];

                var newAtt = {};
                newAtt.Name = "(" + $scope.srvPiConfig.elements[elementId].Name + "|" + $scope.srvPiConfig.attributes[attId].Name + ")";
                newAtt.Id = attId;
                $scope.srvPiConfig.subscribedAttributes.push(newAtt);
                socket.send({MSGTYPE: "set", TYPE: "subscriptions", ATTID: attId});
            }else{
                for(var i in $scope.srvPiConfig.subscribedAttributes){
                    var att = $scope.srvPiConfig.subscribedAttributes[i];
                    if(att.Id == attId) {
                        $scope.srvPiConfig.subscribedAttributes.splice(i, 1);
                        socket.send({MSGTYPE: "remove", TYPE: "subscriptions", ATTID: attId});
                        break;
                    }
                }
            }
        };

        $scope.toggleAttSubscription = function(attId, elementId){
            $scope.setAttSubscription(attId, elementId, $scope.srvPiConfig.attributes[attId].Subscribed);
        };


        $scope.toggleElementSubscription = function(elementId){
            // If founds one active att in the Element, unset them all
            var hasActiveSubs = false;

            if(!$scope.srvPiConfig.elements[elementId].STA || !$scope.srvPiConfig.elements[elementId].STA){
                console.warn("Element " + $scope.srvPiConfig.elements[elementId].Name + " Missing STA or SID.");
                alert("Element " + $scope.srvPiConfig.elements[elementId].Name + " Missing STA or SID.");
                return;
            }

            for(var i in $scope.srvPiConfig.elements[elementId].Attributes){
                var attId = $scope.srvPiConfig.elements[elementId].Attributes[i];

                if($scope.srvPiConfig.attributes[attId].Subscribed) {
                    hasActiveSubs = true;
                    break;
                }
            }
            for(var i in $scope.srvPiConfig.elements[elementId].Attributes){
                var attId = $scope.srvPiConfig.elements[elementId].Attributes[i];

                $scope.srvPiConfig.attributes[attId].Subscribed = !hasActiveSubs;
                $scope.setAttSubscription(attId, elementId, !hasActiveSubs);
            }
        };

        $scope.toggleAllElementSubscription = function(){
            var hasActiveSubs = false;
            for(var i in $scope.srvPiConfig.attributes){
                var att = $scope.srvPiConfig.attributes[i];

                if(att.Subscribed) {
                    hasActiveSubs = true;
                    break;
                }
            }
            for(var j in $scope.srvPiConfig.elements){
                for(var k in $scope.srvPiConfig.elements[j].Attributes){

                    if(!$scope.srvPiConfig.elements[j].STA || !$scope.srvPiConfig.elements[j].STA){
                        console.warn("Element " + $scope.srvPiConfig.elements[j].Name + " Missing STA or SID. All element subscription Ended");
                        alert("Element " + $scope.srvPiConfig.elements[j].Name + " Missing STA or SID. All element subscription Ended");
                        return;
                    }

                    var attId = $scope.srvPiConfig.elements[j].Attributes[k];

                    $scope.srvPiConfig.attributes[attId].Subscribed = !hasActiveSubs;
                    $scope.setAttSubscription(attId, j, !hasActiveSubs);
                }
            }
        };

        $scope.addElementMappings = function(elementId){
            var parentElement = $scope.srvPiConfig.elements[elementId];

            if(!parentElement.STA || !parentElement.SID){
                console.warn("Element " + parentElement.Name + " Missing STA or SID.");
                return;
            }

            if(!parentElement.TemplateName || parentElement.TemplateName == ""){
                console.warn("No Template Name for Element: "+ parentElement.Name);
                return;
            }

            for(var i in parentElement.Attributes){
                $scope.addAttributeMapping(parentElement.Attributes[i]);
            }
        };

        $scope.removeElementMappings = function(elementId){
            var parentElement = $scope.srvPiConfig.elements[elementId];

            if(!parentElement.STA || !parentElement.SID){
                console.warn("Element " + parentElement.Name + " Missing STA or SID.");
                return;
            }
            for(var i in parentElement.Attributes){
                $scope.removeAttributeMapping(parentElement.Attributes[i]);
            }
        };

        $scope.addAttributeMapping = function(attId){
            if(!$scope.srvPiConfig.attributes[attId]){
                console.log("Trying to Map to invalid attributeId");
                return;
            }
            if(!$scope.srvPiConfig.attributes[attId].ParentElement){
                console.log("Invalid Parent Element of attribute: " + attId);
                return;
            }
            var elementId = $scope.srvPiConfig.attributes[attId].ParentElement;
            var parentElement = $scope.srvPiConfig.elements[elementId];
            if(!elementId)
                console.log("ParentElement not found")

            if(!$scope.srvDConfig.mappings)
                $scope.srvDConfig.mappings = {};

            if(!$scope.srvDConfig.mappings[parentElement.STA])
                $scope.srvDConfig.mappings[parentElement.STA] = {};

            if(!$scope.srvDConfig.mappings[parentElement.STA].SIDs)
                $scope.srvDConfig.mappings[parentElement.STA].SIDs = {};

            if(!$scope.srvDConfig.mappings[parentElement.STA].SIDs[parentElement.SID])
                $scope.srvDConfig.mappings[parentElement.STA].SIDs[parentElement.SID] = {};

            if(!$scope.srvDConfig.mappings[parentElement.STA].SIDs[parentElement.SID].VARS)
                $scope.srvDConfig.mappings[parentElement.STA].SIDs[parentElement.SID].VARS = {};

            $scope.srvDConfig.mappings[parentElement.STA].SIDs[parentElement.SID].VARS[$scope.srvPiConfig.attributes[attId].Name] = {};
            $scope.srvDConfig.mappings[parentElement.STA].SIDs[parentElement.SID].VARS[$scope.srvPiConfig.attributes[attId].Name].WebId = $scope.srvPiConfig.attributes[attId].WebId;
            $scope.srvDConfig.mappings[parentElement.STA].SIDs[parentElement.SID].RMODEL = parentElement.TemplateName;
            if(!$scope.srvDConfig.mappedAttIds)
                $scope.srvDConfig.mappedAttIds = {};
            $scope.srvDConfig.mappedAttIds[attId] = true;

        };

        $scope.removeAttributeMapping = function(attId){
            if(!$scope.srvPiConfig.attributes[attId]){
                console.log("Trying to UnMap to invalid attributeId");
                return;
            }
            if(!$scope.srvPiConfig.attributes[attId].ParentElement){
                console.log("Invalid Parent Element of attribute: " + attId);
                return;
            }
            var elementId = $scope.srvPiConfig.attributes[attId].ParentElement;
            var parentElement = $scope.srvPiConfig.elements[elementId];
            if($scope.srvDConfig.mappings[parentElement.STA].SIDs[parentElement.SID].VARS[$scope.srvPiConfig.attributes[attId].Name]) {
                delete $scope.srvDConfig.mappings[parentElement.STA].SIDs[parentElement.SID].VARS[$scope.srvPiConfig.attributes[attId].Name];
            }
            if($scope.srvDConfig.mappedAttIds && $scope.srvDConfig.mappedAttIds[attId]){
                delete $scope.srvDConfig.mappedAttIds[attId];
            }

        };

        /**
         * Websocket Implementation for Tree Navigation
         */

        socket.onMessage(function(msg){
            if(msg.data != "WS Connected")
                try {
                    var response = angular.fromJson(msg.data);
                    console.log(response);
                    switch(response.MSGTYPE){
                        case "log":
                            $scope.log += response.DATA;
                            break;
                        case "updatePiConfig":
                            $scope.srvPiConfig = response.DATA;
                            break;
                        case "data":
                            if($scope.srvPiConfig.attributes[response.ATTID]){
                                $scope.srvPiConfig.attributes[response.ATTID].LastValue = response.VALUE;
                            }else{
                                console.log("Received data from attribute not present in the hierarchy Tree. Attribute ID: " + response.ATTID)
                            }
                            break;
                        default:
                            break;
                    }

                }catch(e){
                    console.log(e);
                }
            else{
                console.log("Received: " + msg.data);
            }
        });

        // Refresh all data starting from the Servers + Databases of the Hierarchy
        $scope.getDataBases = function(){
            console.log("Requesting databases")
            socket.send({MSGTYPE: "get", TYPE: "databases"});
        }();

        $scope.getElement = function( id){
            if(id){
                socket.send({MSGTYPE: "get", TYPE: "element", ID: id});
            }
        }

    })
    .factory('socket', function($websocket) {
        // Open a WebSocket connection
        var socket = $websocket('ws://'+window.location.hostname+':7400/ws/pielements');
        return socket;
    });

(function(f){f.module("angularTreeview",[]).directive("treeModel",function($compile){return{restrict:"A",link:function(b,h,c){var a=c.treeId,g=c.treeModel,e=c.nodeLabel||"label",d=c.nodeChildren||"children",e='<ul><li data-ng-repeat="node in '+g+'"><i class="collapsed" data-ng-show="node.'+d+'.length && node.collapsed" data-ng-click="'+a+'.selectNodeHead(node)"></i><i class="expanded" data-ng-show="node.'+d+'.length && !node.collapsed" data-ng-click="'+a+'.selectNodeHead(node)"></i><i class="normal" data-ng-hide="node.'+
    d+'.length"></i> <span data-ng-class="node.selected" data-ng-click="'+a+'.selectNodeLabel(node)">{{node.'+e+'}}</span><div data-ng-hide="node.collapsed" data-tree-id="'+a+'" data-tree-model="node.'+d+'" data-node-id='+(c.nodeId||"id")+" data-node-label="+e+" data-node-children="+d+"></div></li></ul>";a&&g&&(c.angularTreeview&&(b[a]=b[a]||{},b[a].selectNodeHead=b[a].selectNodeHead||function(a){a.collapsed=!a.collapsed},b[a].selectNodeLabel=b[a].selectNodeLabel||function(c){b[a].currentNode&&b[a].currentNode.selected&&
    (b[a].currentNode.selected=void 0);c.selected="selected";b[a].currentNode=c}),h.html('').append($compile(e)(b)))}}})})(angular);