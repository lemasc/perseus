const PropTypes = require('prop-types');
/* eslint-disable react/sort-comp */

const React = require("react");
const Tooltip = require("react-components/tooltip.jsx");
const _ = require("underscore");

const ApiClassNames = require("../perseus-api.jsx").ClassNames;
const MathInput = require("./math-input.jsx");
const Renderer = require("../renderer.jsx");
const TextInput = require("./text-input.jsx");
const MathOutput = require("../components/math-output.jsx");

const Gorgon = require("../gorgon/gorgon.js");
const {linterContextProps, linterContextDefault} = require("../gorgon/proptypes.js");

const captureScratchpadTouchStart = require("../util.js")
    .captureScratchpadTouchStart;

const MATH = "math";
const TEXT = "text";
const TEX = "tex";

class InputWithExamples extends React.Component {
    static propTypes = {
        type: PropTypes.oneOf([MATH, TEXT, TEX]),
        value: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string,
        examples: PropTypes.arrayOf(PropTypes.string).isRequired,
        shouldShowExamples: PropTypes.bool,
        convertDotToTimes: PropTypes.bool,
        buttonSet: PropTypes.string,
        buttonsVisible: PropTypes.oneOf(["always", "never", "focused"]),
        labelText: PropTypes.string,
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
        disabled: PropTypes.bool,

        // A unique string identifying this InputWithExamples
        id: PropTypes.string.isRequired,
        linterContext: linterContextProps
    }

    static defaultProps = {
            type: TEXT,
            shouldShowExamples: true,
            onFocus: function() {},
            onBlur: function() {},
            disabled: false,
            linterContext: linterContextDefault
    }

    constructor(props) {
        super(props)
        this.state = {
            focused: false,
            showExamples: false,
        };
    }

    _getUniqueId = () => {
        return `input-with-examples-${btoa(this.props.id).replace(/=/g, "")}`;
    }

    _getInputClassName = () => {
        // <MathOutput> is a special component that manages its own class and
        // state, as it's a <span> that wants to act like an <input>.
        if (this.props.type === TEX) {
            return this.props.className;
        }

        // Otherwise, we need to add these INPUT and FOCUSED tags here.
        let className = ApiClassNames.INPUT + " " + ApiClassNames.INTERACTIVE;
        if (this.state.focused) {
            className += " " + ApiClassNames.FOCUSED;
        }
        if (this.props.className) {
            className += " " + this.props.className;
        }
        return className;
    }

    _getPropsForInputType = () => {
        // Minimal set of props, used by each input type
        const inputProps = {
            "aria-describedby": this._getUniqueId(),
            ref: "input",
            className: this._getInputClassName(),
            labelText: this.props.labelText,
            value: this.props.value,
            onFocus: this._handleFocus,
            onBlur: this._handleBlur,
            disabled: this.props.disabled,
        };

        if (this.props.type === TEX) {
            return inputProps;
        }

        // Add useful props required for MATH and TEXT modes
        _.extend(inputProps, {
            onChange: this.props.onChange,
            onTouchStart: captureScratchpadTouchStart,
        });

        // And add final props that are MATH- and TEXT-specific
        if (this.props.type === MATH) {
            return _.extend(
                {
                    buttonSet: this.props.buttonSet,
                    buttonsVisible: this.props.buttonsVisible,
                    convertDotToTimes: this.props.convertDotToTimes,
                },
                inputProps
            );
        } else if (this.props.type === TEXT) {
            return _.extend(
                {
                    autoCapitalize: "off",
                    autoComplete: "off",
                    autoCorrect: "off",
                    spellCheck: "false",
                },
                inputProps
            );
        }
    }

    _getComponentForInputType = () => {
        switch (this.props.type) {
            case TEX:
                return MathOutput;

            case MATH:
                return MathInput;

            case TEXT:
                return TextInput;

            default:
                return null;
        }
    }

    _renderInput = () => {
        const inputProps = this._getPropsForInputType();
        const InputComponent = this._getComponentForInputType();
        return <InputComponent {...inputProps} />;
    }

    render = () => {
        const input = this._renderInput();

        // Static rendering, which doesn't include the 'tooltip' logic that the
        // other types require, and is hence handled separately.
        if (this.props.type === TEX) {
            return input;
        }

        // Else, we need to be able to show examples
        const examplesContent = _.map(this.props.examples, example => {
            return "- " + example;
        }).join("\n");

        const showExamples =
            this.props.shouldShowExamples && this.state.showExamples;

        return (
            <Tooltip
                ref="tooltip"
                className="perseus-formats-tooltip preview-measure"
                horizontalPosition="left"
                horizontalAlign="left"
                verticalPosition="bottom"
                arrowSize={10}
                borderColor="#ccc"
                show={showExamples}
            >
                {input}
                <div id={this._getUniqueId()}>
                    <Renderer
                        content={examplesContent}
                        linterContext={
                            Gorgon.pushContextStack(
                                this.props.linterContext, 'input-with-examples'
                            )
                        }
                    />
                </div>
            </Tooltip>
        );
    }

    _handleFocus = () => {
        this.props.onFocus();
        this.setState({
            focused: true,
            showExamples: true,
        });
    }

    show = () => {
        this.setState({showExamples: true});
    }

    hide = () => {
        this.setState({showExamples: false});
    }

    _handleBlur = () => {
        this.props.onBlur();
        this.setState({
            focused: false,
            showExamples: false,
        });
    }

    focus = () => {
        this.refs.input.focus();
    }

    blur = () => {
        this.refs.input.blur();
    }

    handleChange(e) {
        this.props.onChange(e.target.value);
    }
}

module.exports = InputWithExamples;
