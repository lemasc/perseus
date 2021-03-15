/* eslint-disable brace-style, comma-dangle, no-undef, no-var, object-curly-spacing, react/forbid-prop-types, react/prop-types, react/sort-comp */
/* TODO(csilvers): fix these lint errors (http://eslint.org/docs/rules): */
/* To fix, remove an entry above, run ka-lint, and fix errors. */

var classNames = require("classnames");
const PropTypes = require('prop-types');
var React = require("react");
var _ = require("underscore");

var InputWithExamples = require("../components/input-with-examples.jsx");
const SimpleKeypadInput = require("../components/simple-keypad-input.jsx");
var ParseTex = require("../tex-wrangler.js").parseTex;
var PossibleAnswers = require("../components/possible-answers.jsx");
const KhanAnswerTypes = require("../util/answer-types.js");

const {keypadElementPropType} = require("../../math-input").propTypes;
const {
    linterContextProps,
    linterContextDefault,
} = require("../gorgon/proptypes.js");

var ApiClassNames = require("../perseus-api.jsx").ClassNames;
var ApiOptions = require("../perseus-api.jsx").Options;

var answerTypes = {
    number: {
        name: "Numbers",
        forms: "integer, decimal, proper, improper, mixed",
    },
    decimal: {
        name: "Decimals",
        forms: "decimal",
    },
    integer: {
        name: "Integers",
        forms: "integer",
    },
    rational: {
        name: "Fractions and mixed numbers",
        forms: "integer, proper, improper, mixed",
    },
    improper: {
        name: "Improper numbers (no mixed)",
        forms: "integer, proper, improper",
    },
    mixed: {
        name: "Mixed numbers (no improper)",
        forms: "integer, proper, mixed",
    },
    percent: {
        name: "Numbers or percents",
        forms: "integer, decimal, proper, improper, mixed, percent",
    },
    pi: {
        name: "Numbers with pi",
        forms: "pi",
    }
};

var formExamples = {
    integer(options) {
        return i18n._("an integer, like $6$");
    },
    proper(options) {
        if (options.simplify === "optional") {
            return i18n._("a *proper* fraction, like $1/2$ or $6/10$");
        } else {
            return i18n._("a *simplified proper* fraction, like $3/5$");
        }
    },
    improper(options) {
        if (options.simplify === "optional") {
            return i18n._("an *improper* fraction, like $10/7$ or $14/8$");
        } else {
            return i18n._("a *simplified improper* fraction, like $7/4$");
        }
    },
    mixed(options) {
        return i18n._("a mixed number, like $1\\ 3/4$");
    },
    decimal(options) {
        return i18n._("an *exact* decimal, like $0.75$");
    },
    percent(options) {
        return i18n._("a percent, like $12.34\\%$");
    },
    pi(options) {
        return i18n._(
            "a multiple of pi, like $12\\ \\text{pi}$ or " +
                "$2/3\\ \\text{pi}$"
        );
    }
};

class InputNumber extends React.Component {
    static propTypes = {
        answerType: PropTypes.oneOf(Object.keys(answerTypes)),
        currentValue: PropTypes.string,
        keypadElement: keypadElementPropType,
        reviewModeRubric: PropTypes.object,
        widgetId: PropTypes.string.isRequired,
        linterContext: linterContextProps,
    }

    static defaultProps = {
            currentValue: "",
            size: "normal",
            answerType: "number",
            apiOptions: ApiOptions.defaults,
            linterContext: linterContextDefault
    }

    shouldShowExamples() {
        return (
            this.props.answerType !== "number" &&
            !this.props.apiOptions.staticRender
        );
    }

    render() {
        if (this.props.apiOptions.customKeypad) {
            // TODO(charlie): Support "Review Mode".
            return (
                <SimpleKeypadInput
                    ref="input"
                    value={this.props.currentValue}
                    //keypadElement={this.props.keypadElement}
                    onChange={this.handleChange}
                    onFocus={this._handleFocus}
                    onBlur={this._handleBlur}
                />
            );
        } else {
            // HACK(johnsullivan): Create a function with shared logic between
            // this and NumericInput.
            var rubric = this.props.reviewModeRubric;
            var correct = null;
            var answerBlurb = null;
            if (this.props.apiOptions.satStyling && rubric) {
                var score = this.simpleValidate(rubric);
                correct =
                    score.type === "points" && score.earned === score.total;

                if (!correct) {
                    // TODO(johnsullivan): Make this a little more
                    // human-friendly.
                    var answerString = String(rubric.value);
                    if (rubric.inexact && rubric.maxError) {
                        answerString += " \u00B1 " + rubric.maxError;
                    }
                    var answerStrings = [answerString];
                    answerBlurb = <PossibleAnswers answers={answerStrings} />;
                }
            }

            var classes = {};
            classes["perseus-input-size-" + this.props.size] = true;
            classes[ApiClassNames.CORRECT] =
                rubric && correct && this.props.currentValue;
            classes[ApiClassNames.INCORRECT] =
                rubric && !correct && this.props.currentValue;
            classes[ApiClassNames.UNANSWERED] =
                rubric && !this.props.currentValue;

            var input = (
                <InputWithExamples
                    ref="input"
                    value={this.props.currentValue}
                    onChange={this.handleChange}
                    className={classNames(classes)}
                    type={this._getInputType()}
                    examples={this.examples()}
                    shouldShowExamples={this.shouldShowExamples()}
                    onFocus={this._handleFocus}
                    onBlur={this._handleBlur}
                    id={this.props.widgetId}
                    disabled={this.props.apiOptions.readOnly}
                    linterContext={this.props.linterContext}
                />
            );

            if (answerBlurb) {
                return (
                    <span className="perseus-input-with-answer-blurb">
                        {input}
                        {answerBlurb}
                    </span>
                );
            } else {
                return input;
            }
        }
    }

    handleChange = (newValue, cb) => {
        this.props.onChange({currentValue: newValue}, cb);
    }

    _getInputType = () => {
        if (this.props.apiOptions.staticRender) {
            return "tex";
        } else {
            return "text";
        }
    }

    _handleFocus = () => {
        this.props.onFocus([]);
        // HACK(kevinb): We want to dismiss the feedback popover that webapp
        // displays as soon as a user clicks in in the input field so we call
        // interactionCallback directly.
        const {interactionCallback} = this.props.apiOptions;
        if (interactionCallback) {
            interactionCallback();
        }
    }

    _handleBlur = () => {
        this.props.onBlur([]);
    }

    focus = () => {
        this.refs.input.focus();
        return true;
    }

    focusInputPath = (inputPath) => {
        this.refs.input.focus();
    }

    blurInputPath = (inputPath) => {
        this.refs.input.blur();
    }

    getInputPaths() {
        // The widget itself is an input, so we return a single empty list to
        // indicate this.
        return [[]];
    }

    getGrammarTypeForPath(path) {
        return "number";
    }

    setInputValue(path, newValue, cb) {
        this.props.onChange(
            {
                currentValue: newValue,
            },
            cb
        );
    }

    getUserInput() {
        return {
            currentValue: this.props.currentValue,
        };
    }

    simpleValidate(rubric, onInputError) {
        onInputError = onInputError || function() {};
        return InputNumber.validate(this.getUserInput(), rubric, onInputError);
    }

    examples() {
        var type = this.props.answerType;
        var forms = answerTypes[type].forms.split(/\s*,\s*/);

        var examples = _.map(
            forms,
            function(form) {
                return formExamples[form](this.props);
            },
            this
        );

        return [i18n._("**Your answer should be** ")].concat(examples);
    }
}

_.extend(InputNumber, {
    validate(state, rubric, onInputError) {
        if (rubric.answerType == null) {
            rubric.answerType = "number";
        }
        var val = KhanAnswerTypes.number.createValidatorFunctional(
            rubric.value,
            {
                simplify: rubric.simplify,
                inexact: rubric.inexact || undefined,
                maxError: rubric.maxError,
                forms: answerTypes[rubric.answerType].forms,
            }
        );

        // We may have received TeX; try to parse it before grading.
        // If `currentValue` is not TeX, this should be a no-op.
        var currentValue = ParseTex(state.currentValue);

        var result = val(currentValue);

        // TODO(eater): Seems silly to translate result to this invalid/points
        // thing and immediately translate it back in ItemRenderer.scoreInput()
        if (result.empty) {
            var apiResult = onInputError(
                null, // reserved for some widget identifier
                state.currentValue,
                result.message
            );
            return {
                type: "invalid",
                message: apiResult === false ? null : result.message,
            };
        } else {
            return {
                type: "points",
                earned: result.correct ? 1 : 0,
                total: 1,
                message: result.message,
            };
        }
    }
});

var propTransform = editorProps => {
    const {simplify, size, answerType} = editorProps;
    return {
        simplify,
        size,
        answerType,
    };
};

module.exports = {
    name: "input-number",
    displayName: "Number text box (old)",
    defaultAlignment: "inline-block",
    hidden: true,
    widget: InputNumber,
    transform: propTransform,
    isLintable: true,
};
