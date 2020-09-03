define([
        'dojo/_base/declare',
        'JBrowse/Util',
        'WiggleHighlighter/View/Track/XYPlot'
    ],
    function (
        declare,
        Util,
        XYPlot
    ) {
        return declare([ XYPlot],
            {
                constructor: function(args)
                {
                    var newLabel = (data) => {
                        if (data.length) {
                            // flag set to editing
                            localStorage.setItem('highlightFlag', 1);
                            // add new highlight to storage
                            var dataVal = data[0];
                            dataVal['name'] = this.name;
                            this.highlightStore.addFeature(dataVal);
                        } else {
                            // flag set to removing
                            localStorage.setItem('highlightFlag', 0);
                        }
                    };

                    dojo.subscribe('/jbrowse/v1/n/globalHighlightChanged', newLabel)
                },
                _defaultConfig: function () {
                    return Util.deepUpdate(dojo.clone(this.inherited(arguments)),
                        {
                            onHighlightClick: function (feature, track) {
                                // eslint-disable-next-line ra  dix
                                const highlightFlag = parseInt(localStorage.getItem('highlightFlag'));
                                // uses highlightFlag to determine if editing or removing
                                if (highlightFlag === 1) {
                                    // this is wear we define the types of labels, to create a new kind of
                                    const states = ['unknown', 'peak', 'noPeak', 'peakStart', 'peakEnd'];
                                    // label add to this list and the two down below for determining the color
                                    // loops through known labels for the label clicked

                                    for(i = 0; i < states.length; i++)
                                    {
                                        if( feature.get('label') === states[i] )
                                        {
                                            var args = {
                                                'ref': feature.get('ref'),
                                                'start': feature.get('start'),
                                                'end': feature.get('end'),
                                                'label': states[(i+1)%states.length]
                                            }
                                            this.highlightStore.updateFeature(args);
                                            break;
                                        }
                                    }
                                } else {

                                    // json of information of removed label
                                    var removeJSON = {
                                        'ref': feature.get('ref'),
                                        'start': feature.get('start'),
                                        'end': feature.get('end')
                                    };
                                    this.highlightStore.removeFeature(removeJSON);
                                }
                                // redraw to update model
                                track.browser.view.redrawTracks()
                            },

                            highlightColor: function (feature, track) {
                                // determins the color of the see through part of the label
                                // to add new type of label add type to this list
                                const states = {
                                    'unknown': 'rgba(100,100,100,.4)',
                                    'peak': 'rgba(180,167,214,0.4)',
                                    'noPeak': 'rgba(255,251,204,0.4)',
                                    'peakStart': 'rgba(255,210,241,0.4)',
                                    'peakEnd': 'rgba(244,204,204,0.4)'

                                };
                                return states[feature.get('label') || 'unknown'];
                            },

                            indicatorColor: function (feature, track) {
                                // determins the color of the bar at the bottom of the label
                                // to add new type of label add type to this list
                                const states = {
                                    'unknown': 'rgb(100,100,100)',
                                    'peak': 'rgb(180,167,214)',
                                    'noPeak': 'rgb(255,251,204)',
                                    'peakStart': 'rgb(255,210,241)',
                                    'peakEnd': 'rgb(244,204,204)'};
                                return states[feature.get('label') || 'unknown'];
                            },

                            style:
                                {
                                    label: function( feature, track )
                                    {
                                        return feature.get('label');
                                    }
                                },


                        });
                },
            });
    });
