(function($) {

    $.fn.createMap = function (serverAddress) {
        this.css("color", "green");

        var _layers = this._layers = {};

        var map = this.map = new OpenLayers.Map({
            div: "map",
            allOverlays: true,
            layers: [
            new OpenLayers.Layer.OSM("MyTiles", serverAddress + "/tiles/${z}/${x}/${y}.png", {
                numZoomLevels: 20,
                isBaseLayer: false
            })
            ]
        });

        this.map.events.register("mousemove", map, function (e) {
            map.mouseposition = e.xy;
        });

        this.map.setCenter(new OpenLayers.LonLat(52.5198, 29.6164).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913")), 10);

        this.setZoomLevel = function (zoomLevel) {
            map.setCenter(new OpenLayers.LonLat(map.getCenter().lon, map.getCenter().lat).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913")), zoomLevel);
            return this;
        };

        this.setLocation = function (lat, lon) {
            map.setCenter(new OpenLayers.LonLat(lon, lat).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913")), map.zoom);
            return this;
        };

        this.putIcon = function (lat, lon, icon) {

            var layer = this._getlayerDefault();
            var icon2 = {};
            icon2.icon = layer.addIcon(lat, lon, icon);

            layer.objects[icon2.icon.id] = icon2;

            icon2._click = function () { };
            icon2.click = function (f) {
                this._click = f;
            };

            icon2._mouseover = function () { };
            icon2.mouseover = function (f) {
                this._mouseover = f;
            };

            icon2._mouseout = function () { };
            icon2.mouseout = function (f) {
                this._mouseout = f;
            };

            icon2._popup = undefined;
            icon2.tooltip = function (div) {
                this._popup = div;
            };


            return icon2;
        };

        this.drawLine = function (from, to, style) {

            var layer = this._getlayerDefault();

            var line2 = {};

            line2.line = layer.drawLine(from, to, style);
            
            layer.objects[line2.line.id] = line2;

            line2._click = function () { };
            line2.click = function (f) {
                this._click = f;
            };

            line2._mouseover = function () { };
            line2.mouseover = function (f) {
                this._mouseover = f;
            };

            line2._mouseout = function () { };
            line2.mouseout = function (f) {
                this._mouseout = f;
            };

            line2._popup = undefined;
            line2.tooltip = function (div) {
                this._popup = div;
            };

            return line2;
        }


        this._getlayerDefault = function () {

            if (_layers["defualtMyMapLayer"] === undefined) {

                var layer = newLayer("defualtMyMapLayer", map);

                layer.events.register('featureclick', layer, function (e) {
                    
                    var object = layer.objects[e.feature.id];
                    
                    var g = e.feature.geometry;

                    var fpoint = new OpenLayers.Geometry.Point(g.x, g.y).transform(new OpenLayers.Projection("EPSG:900913"),new OpenLayers.Projection("EPSG:4326"));

                    e.lat = fpoint.x;
                    e.lon = fpoint.y;

                    object._click(e);
                    
                });

                layer.events.register('featureover', layer, function (e) {

                    var object = layer.objects[e.feature.id];

                    var g = e.feature.geometry;

                    //console.log(map.mouseposition);

                    var fpoint = new OpenLayers.Geometry.Point(g.x, g.y).transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));

                    e.lat = fpoint.x;
                    e.lon = fpoint.y;

                    if (object._popup !== undefined && object._popup !== "") {

                        var xy = $('#' + g.id).offset();

                        //console.log('#' + g.id);

                        $('#' + g.id).mousemove(function (e) {
                            
                            var div = $('<div style="position:absolute; top:10px; left:200px; z-index:9999999;"></div>');
                            div.css({top:map.mouseposition.y,left:map.mouseposition.x});

                            div.append($(object._popup));

                            $('body').append(div);

                            /*$(this).qtip({
                                content: {
                                    text: $(object._popup)
                                },
                                position: {
                                    // my: 'bottom center',
                                    //at: 'top center',
                                    adjust: { mouse: true }
                                },
                                style: {
                                    classes: 'qtip-green'
                                }, hide: { event: true }
                            });
                            $('#' + g.id).qtip('show');*/

                        });

                       

                        //console.log(e);
                    }

                });

                layer.events.register('featureout', layer, function (e) {

                    var object = layer.objects[e.feature.id];

                    var g = e.feature.geometry;


                    var fpoint = new OpenLayers.Geometry.Point(g.x, g.y).transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));

                    e.lat = fpoint.x;
                    e.lon = fpoint.y;

                    object._mouseout(e);

                });
                

                _layers["defualtMyMapLayer"] = layer;

                map.addLayer(layer);
            } 

            return _layers["defualtMyMapLayer"];
        }

        return this;
    };



    function newLayer(name, map) {

        var layer = new OpenLayers.Layer.Vector(name);
        layer.objects = {};

        map.addLayer(layer);

        layer.addIcon = function (lat, lon, icon, events) {

            var fpoint = new OpenLayers.Geometry.Point(lon, lat).transform(
                  new OpenLayers.Projection("EPSG:4326"),
                  new OpenLayers.Projection("EPSG:900913")
              );

            var icon = new OpenLayers.Feature.Vector(fpoint, {}, {
                externalGraphic: icon,
                graphicYOffset: -28,
                graphicWidth: 30,
                graphicHeight: 30,
                fillOpacity: 1
            });
            

            layer.addFeatures(icon);


            return icon;
        }


        layer.drawLine = function (from, to, style) {

            var start_point = new OpenLayers.Geometry.Point(from.lon, from.lat);
            start_point.transform(
            new OpenLayers.Projection("EPSG:4326"),
            new OpenLayers.Projection("EPSG:900913")
            );

            var end_point = new OpenLayers.Geometry.Point(to.lon, to.lat);
            end_point.transform(
            new OpenLayers.Projection("EPSG:4326"),
            new OpenLayers.Projection("EPSG:900913")
            );

            var line = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString([start_point, end_point]));

            layer.events.register('beforefeatureadded', layer, function (e) {

                if (style === undefined)
                    style = {};

                style.strokeColor = style.strokeColor || "#00ff00";
                style.strokeWidth = style.strokeWidth || 2;
                style.strokeOpacity = style.strokeOpacity || 100;
                style.pointRadius = style.pointRadius || 2;

                console.log(style);

                var lineStyle = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
                lineStyle.strokeColor = style.strokeColor;
                lineStyle.strokeWidth = style.strokeWidth;
                lineStyle.strokeOpacity = style.strokeOpacity;
                lineStyle.pointRadius = style.pointRadius;

                e.feature.style = lineStyle;

            });

            layer.addFeatures([line]);

            return line;
        }

        layer.clear = function () {
            layer.destroyFeatures();
        }

        return layer;
    }


})(jQuery);