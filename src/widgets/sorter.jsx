const PropTypes = require('prop-types');
/* eslint-disable comma-dangle, no-var, one-var, react/forbid-prop-types, react/sort-comp */
/* TODO(csilvers): fix these lint errors (http://eslint.org/docs/rules): */
/* To fix, remove an entry above, run ka-lint, and fix errors. */

var React = require("react");
var _ = require("underscore");

var Sortable = require("../components/sortable.jsx");

const ApiOptions = require("../perseus-api.jsx").Options;
var shuffle = require("../util.js").shuffle;
const {
    linterContextProps,
    linterContextDefault,
} = require("../gorgon/proptypes.js");

var HORIZONTAL = "horizontal",
    VERTICAL = "vertical";

class Sorter extends React.Component {
    static propTypes = {
        apiOptions: ApiOptions.propTypes,
        correct: PropTypes.array,
        layout: PropTypes.oneOf([HORIZONTAL, VERTICAL]),
        onChange: PropTypes.func,
        padding: PropTypes.bool,
        problemNum: PropTypes.number,
        trackInteraction: PropTypes.func.isRequired,
        linterContext: linterContextProps,
    };

    static defaultProps = {
            correct: [],
            layout: HORIZONTAL,
            padding: true,
            problemNum: 0,
            onChange: function() {},
            linterContext: linterContextDefault,
    };

    render() {
        var options = shuffle(
            this.props.correct,
            this.props.problemNum,
            /* ensurePermuted */ true
        );

        const marginPx = this.props.apiOptions.isMobile ? 8 : 5;

        return (
            <div className="perseus-widget-sorter perseus-clearfix">
                <Sortable
                    options={options}
                    layout={this.props.layout}
                    margin={marginPx}
                    padding={this.props.padding}
                    onChange={this.handleChange}
                    linterContext={this.props.linterContext}
                    ref="sortable"
                />
            </div>
        );
    }

    handleChange = e => {
        this.props.onChange(e);
        this.props.trackInteraction();
    }

    getUserInput = () => {
        return {options: this.refs.sortable.getOptions()};
    }

    simpleValidate = rubric =>{
        return Sorter.validate(this.getUserInput(), rubric);
    }
}

_.extend(Sorter, {
    validate: function(state, rubric) {
        var correct = _.isEqual(state.options, rubric.correct);

        return {
            type: "points",
            earned: correct ? 1 : 0,
            total: 1,
            message: null,
        };
    },
});

module.exports = {
    name: "sorter",
    displayName: "Sorter",
    widget: Sorter,
    isLintable: true,
};
