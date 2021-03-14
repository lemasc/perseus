var PropTypes = require('prop-types');
/* eslint-disable comma-dangle, no-var, react/sort-comp */
/* TODO(csilvers): fix these lint errors (http://eslint.org/docs/rules): */
/* To fix, remove an entry above, run ka-lint, and fix errors. */

/* globals $_ */
var React = require("react");
var _ = require("underscore");

var Changeable = require("../mixins/changeable.jsx");
var PerseusMarkdown = require("../perseus-markdown.jsx");
var WidgetJsonifyDeprecated = require("../mixins/widget-jsonify-deprecated.jsx");
const { extend } = require('jquery');

var EN_DASH = "\u2013";

class PassageRef extends React.Component {
    static propTypes = {
        ...Changeable.propTypes,
        passageNumber: PropTypes.number,
        referenceNumber: PropTypes.number,
        summaryText: PropTypes.string,
    }

    getDefaultProps() {
        return {
            passageNumber: 1,
            referenceNumber: 1,
            summaryText: "",
        };
    }

    getInitialState() {
        return {
            lineRange: null,
            content: null,
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            !_.isEqual(this.props, nextProps) ||
            !_.isEqual(this.state, nextState)
        );
    }

    getUserInput() {
        return WidgetJsonifyDeprecated.getUserInput.call(this);
    }

    render() {
        var lineRange = this.state.lineRange;
        var lineRangeOutput;
        if (!lineRange) {
            lineRangeOutput = $_(
                {lineRange: `?${EN_DASH}?`},
                "lines %(lineRange)s"
            );
        } else if (lineRange[0] === lineRange[1]) {
            lineRangeOutput = $_(
                {lineNumber: lineRange[0]},
                "line %(lineNumber)s"
            );
        } else {
            lineRangeOutput = $_(
                {
                    lineRange: lineRange[0] + EN_DASH + lineRange[1],
                },
                "lines %(lineRange)s"
            );
        }

        var summaryOutput;
        if (this.props.summaryText) {
            var summaryTree = PerseusMarkdown.parseInline(
                this.props.summaryText
            );
            summaryOutput = (
                <span aria-hidden={true}>
                    {" "}{/* curly quotes */}
                    (&ldquo;
                    {PerseusMarkdown.basicOutput(summaryTree)}
                    &rdquo;)
                </span>
            );
        } else {
            summaryOutput = null;
        }

        return (
            <span>
                {lineRangeOutput}
                {summaryOutput}
                {lineRange &&
                    <div className="perseus-sr-only">
                        {this.state.content}
                    </div>}
            </span>
        );
    }

    change(...args) {
        return Changeable.change.apply(this, args);
    }

    componentDidMount() {
        this._deferredUpdateRange();

        this._throttledUpdateRange = _.throttle(this._deferredUpdateRange, 500);
        window.addEventListener("resize", this._throttledUpdateRange);
    }

    componentDidUpdate() {
        this._deferredUpdateRange();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this._throttledUpdateRange);
    }

    _deferredUpdateRange() {
        _.defer(this._updateRange);
    }

    _updateRange() {
        var passage = this.props.findWidgets(
            "passage " + this.props.passageNumber
        )[0];

        var refInfo = null;
        if (passage) {
            refInfo = passage.getReference(this.props.referenceNumber);
        }

        if (this.isMounted()) {
            if (refInfo) {
                this.setState({
                    lineRange: [refInfo.startLine, refInfo.endLine],
                    content: refInfo.content,
                });
            } else {
                this.setState({
                    lineRange: null,
                    content: null,
                });
            }
        }
    }

    simpleValidate(rubric) {
        return PassageRef.validate(this.getUserInput(), rubric);
    }
}

_.extend(PassageRef, {
    validate(state, rubric) {
        return {
            type: "points",
            earned: 0,
            total: 0,
            message: null,
        };
    }
});

module.exports = {
    name: "passage-ref",
    displayName: "PassageRef (SAT only)",
    defaultAlignment: "inline",
    widget: PassageRef,
    transform: editorProps => {
        return _.pick(
            editorProps,
            "passageNumber",
            "referenceNumber",
            "summaryText"
        );
    },
    version: {major: 0, minor: 1}
};
