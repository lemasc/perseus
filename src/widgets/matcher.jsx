const PropTypes = require('prop-types');
/* eslint-disable comma-dangle, no-var, react/forbid-prop-types, react/sort-comp */
/* TODO(csilvers): fix these lint errors (http://eslint.org/docs/rules): */
/* To fix, remove an entry above, run ka-lint, and fix errors. */

const React = require("react");
const {StyleSheet, css} = require("aphrodite");
const _ = require("underscore");

const Renderer = require("../renderer.jsx");
const Sortable = require("../components/sortable.jsx");

const ApiOptions = require("../perseus-api.jsx").Options;
const shuffle = require("../util.js").shuffle;
const seededRNG = require("../util.js").seededRNG;
const {
    linterContextProps,
    linterContextDefault,
} = require("../gorgon/proptypes.js");

const HACKY_CSS_CLASSNAME = "perseus-widget-matcher";

class Matcher extends React.Component {
    static propTypes = {
        apiOptions: ApiOptions.propTypes,
        labels: PropTypes.array,
        left: PropTypes.array,
        onChange: PropTypes.func,
        orderMatters: PropTypes.bool,
        padding: PropTypes.bool,
        problemNum: PropTypes.number,
        right: PropTypes.array,
        trackInteraction: PropTypes.func.isRequired,
        linterContext: linterContextProps,
    }

    static defaultProps = {
            left: [],
            right: [],
            labels: ["", ""],
            orderMatters: false,
            padding: true,
            problemNum: 0,
            onChange: function() {},
            linterContext: linterContextDefault,
        };

    constructor(props) {
        super(props)
        this.state = {
            leftHeight: 0,
            rightHeight: 0,
        };
    }

    render() {
        // Use the same random() function to shuffle both columns sequentially
        var rng = seededRNG(this.props.problemNum);

        var left;
        if (!this.props.orderMatters) {
            // If the order doesn't matter, don't shuffle the left column
            left = this.props.left;
        } else {
            left = shuffle(this.props.left, rng, /* ensurePermuted */ true);
        }

        var right = shuffle(this.props.right, rng, /* ensurePermuted */ true);

        var showLabels = _.any(this.props.labels);
        var constraints = {
            height: _.max([this.state.leftHeight, this.state.rightHeight]),
        };

        const cellMarginPx = this.props.apiOptions.isMobile ? 8 : 5;

        return (
            <table className={css(styles.widget) + " " + HACKY_CSS_CLASSNAME}>
                <tbody>
                    {showLabels &&
                        <tr className={css(styles.row)}>
                            <th
                                className={css(
                                    styles.column,
                                    styles.columnLabel
                                )}
                            >
                                <Renderer
                                    content={this.props.labels[0] || "..."}
                                    linterContext={this.props.linterContext}
                                />
                            </th>
                            <th
                                className={css(
                                    styles.column,
                                    styles.columnRight,
                                    styles.columnLabel
                                )}
                            >
                                <Renderer
                                    content={this.props.labels[1] || "..."}
                                    linterContext={this.props.linterContext}
                                />
                            </th>
                        </tr>}
                    <tr className={css(styles.row)}>
                        <td className={css(styles.column)}>
                            <Sortable
                                options={left}
                                layout="vertical"
                                padding={this.props.padding}
                                disabled={!this.props.orderMatters}
                                constraints={constraints}
                                onMeasure={this.onMeasureLeft}
                                onChange={this.changeAndTrack}
                                margin={cellMarginPx}
                                linterContext={this.props.linterContext}
                                ref="left"
                            />
                        </td>
                        <td className={css(styles.column, styles.columnRight)}>
                            <Sortable
                                options={right}
                                layout="vertical"
                                padding={this.props.padding}
                                constraints={constraints}
                                onMeasure={this.onMeasureRight}
                                onChange={this.changeAndTrack}
                                margin={cellMarginPx}
                                linterContext={this.props.linterContext}
                                ref="right"
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }

    changeAndTrack = (e) => {
        this.props.onChange(e);
        this.props.trackInteraction();
    }

    onMeasureLeft = (dimensions) => {
        var height = _.max(dimensions.heights);
        this.setState({leftHeight: height});
    }

    onMeasureRight = (dimensions) => {
        var height = _.max(dimensions.heights);
        this.setState({rightHeight: height});
    }

    getUserInput = () => {
        return {
            left: this.refs.left.getOptions(),
            right: this.refs.right.getOptions(),
        };
    }

    simpleValidate = (rubric) => {
        return Matcher.validate(this.getUserInput(), rubric);
    }
}

_.extend(Matcher, {
    validate: function(state, rubric) {
        var correct =
            _.isEqual(state.left, rubric.left) &&
            _.isEqual(state.right, rubric.right);

        return {
            type: "points",
            earned: correct ? 1 : 0,
            total: 1,
            message: null,
        };
    },
});

const padding = 5;
const border = "1px solid #444";

const styles = StyleSheet.create({
    widget: {
        paddingTop: padding,
        maxWidth: "100%",

        // Need to override minWidth in CSS :(
        minWidth: "auto",
    },

    row: {
        // Need to override global rules in CSS :(
        border: 0,
    },

    column: {
        // TODO(benkomalo): constraint to half width?
        padding: 0,
        border: 0,
    },

    columnRight: {
        borderLeft: border,
    },

    columnLabel: {
        fontWeight: "inherit",
        borderBottom: border,
        padding: `0 ${padding}px ${padding}px ${padding}px`,
        textAlign: "center",
    },
});

module.exports = {
    name: "matcher",
    displayName: "Two column matcher",
    widget: Matcher,
    isLintable: true,
};
