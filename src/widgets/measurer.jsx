const PropTypes = require('prop-types');
/* eslint-disable comma-dangle, indent, no-var, react/jsx-closing-bracket-location, react/jsx-indent-props, react/sort-comp */
/* TODO(csilvers): fix these lint errors (http://eslint.org/docs/rules): */
/* To fix, remove an entry above, run ka-lint, and fix errors. */

var React = require("react");
var ReactDOM = require("react-dom");
var _ = require("underscore");

var ApiOptions = require("../perseus-api.jsx").Options;
const GraphUtils = require("../util/graph-utils.js");

var defaultImage = {
    url: null,
    top: 0,
    left: 0,
};

class Measurer extends React.Component {
    static propTypes = {
        apiOptions: ApiOptions.propTypes,
        box: PropTypes.arrayOf(PropTypes.number),
        image: PropTypes.shape({
            url: PropTypes.string,
            top: PropTypes.number,
            left: PropTypes.number,
        }),
        showProtractor: PropTypes.bool,
        protractorX: PropTypes.number,
        protractorY: PropTypes.number,
        showRuler: PropTypes.bool,
        rulerLabel: PropTypes.string,
        rulerTicks: PropTypes.number,
        rulerPixels: PropTypes.number,
        rulerLength: PropTypes.number,
    }

   static defaultProps = {
            box: [480, 480],
            image: {},
            showProtractor: true,
            protractorX: 7.5,
            protractorY: 0.5,
            showRuler: false,
            rulerLabel: "",
            rulerTicks: 10,
            rulerPixels: 40,
            rulerLength: 10,
    }

    render() {
        var image = _.extend({}, defaultImage, this.props.image);
        return (
            <div
                className={
                    "perseus-widget perseus-widget-measurer " +
                    "graphie-container above-scratchpad"
                }
                style={{width: this.props.box[0], height: this.props.box[1]}}
            >
                {image.url &&
                    <img
                        src={image.url}
                        style={{
                            top: image.top,
                            left: image.left,
                        }}
                    />}
                <div className="graphie" ref="graphieDiv" />
            </div>
        );
    }

    componentDidMount() {
        this.setupGraphie();
    }

    componentDidUpdate(prevProps) {
        var shouldSetupGraphie = _.any(
            [
                "box",
                "showProtractor",
                "showRuler",
                "rulerLabel",
                "rulerTicks",
                "rulerPixels",
                "rulerLength",
            ],
            function(prop) {
                return prevProps[prop] !== this.props[prop];
            },
            this
        );

        if (shouldSetupGraphie) {
            this.setupGraphie();
        }
    }

    setupGraphie() {
        var graphieDiv = ReactDOM.findDOMNode(this.refs.graphieDiv);
        $(graphieDiv).empty();
        var graphie = (this.graphie = GraphUtils.createGraphie(graphieDiv));

        var scale = [40, 40];
        var range = [
            [0, this.props.box[0] / scale[0]],
            [0, this.props.box[1] / scale[1]],
        ];
        graphie.init({
            range: range,
            scale: scale,
        });
        graphie.addMouseLayer({
            allowScratchpad: true,
            setDrawingAreaAvailable: this.props.apiOptions
                .setDrawingAreaAvailable,
        });

        if (this.protractor) {
            this.protractor.remove();
        }

        if (this.props.showProtractor) {
            this.protractor = graphie.protractor([
                this.props.protractorX,
                this.props.protractorY,
            ]);
        }

        if (this.ruler) {
            this.ruler.remove();
        }

        if (this.props.showRuler) {
            this.ruler = graphie.ruler({
                center: [
                    (range[0][0] + range[0][1]) / 2,
                    (range[1][0] + range[1][1]) / 2,
                ],
                label: this.props.rulerLabel,
                pixelsPerUnit: this.props.rulerPixels,
                ticksPerUnit: this.props.rulerTicks,
                units: this.props.rulerLength,
            });
        }
    }

    getUserInput() {
        return {};
    }

    simpleValidate = (rubric) => {
        // TODO(joel) - I don't understand how this is useful!
        return Measurer.validate(this.getUserInput(), rubric);
    }

    focus = $.noop
}

_.extend(Measurer, {
    validate: function(state, rubric) {
        return {
            type: "points",
            earned: 1,
            total: 1,
            message: null,
        };
    },
});

var propUpgrades = {
    1: v0props => {
        var v1props = _
            .chain(v0props)
            .omit("imageUrl", "imageTop", "imageLeft")
            .extend({
                image: {
                    url: v0props.imageUrl,
                    top: v0props.imageTop,
                    left: v0props.imageLeft,
                },
            })
            .value();
        return v1props;
    },
};

module.exports = {
    name: "measurer",
    displayName: "Measurer",
    widget: Measurer,
    version: {major: 1, minor: 0},
    propUpgrades: propUpgrades,
};
