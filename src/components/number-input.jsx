/* eslint-disable react/prop-types, react/sort-comp */

const classNames = require("classnames");
const PropTypes = require('prop-types');
const React = require("react");
const ReactDOM = require("react-dom");
const _ = require("underscore");

const firstNumericalParse = require("../util.js").firstNumericalParse;
const captureScratchpadTouchStart = require("../util.js")
    .captureScratchpadTouchStart;
const knumber = require("kmath").number;
const KhanMath = require("../util/math.js");

const toNumericString = KhanMath.toNumericString;
const getNumericFormat = KhanMath.getNumericFormat;

/* An input box that accepts only numeric strings
 *
 * Calls onChange(value, format) for valid numbers.
 * Reverts to the current value onBlur or on [ENTER],
 *   but maintains the format (i.e. 3/2, 1 1/2, 150%)
 * Accepts empty input and sends it to onChange as null
 *   if no numeric placeholder is set.
 * If given a checkValidity function, will turn
 *   the background/outline red when invalid
 * If useArrowKeys is set to true, up/down arrows will
 *   increment/decrement integers
 * Optionally takes a size ("mini", "small", "normal")
 */
class NumberInput extends React.Component {
    static propTypes = {
        value: PropTypes.number,
        format: PropTypes.string,
        placeholder: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
        onChange: PropTypes.func.isRequired,
        onFormatChange: PropTypes.func,
        checkValidity: PropTypes.func,
        size: PropTypes.string,
        label: PropTypes.oneOf(["put your labels outside your inputs!"]),
    }

    static defaultProps = {
            value: null,
            placeholder: null,
            format: null,
            onFormatChange: () => null,
            checkValidity: () => true,
            useArrowKeys: false
    }

    constructor(props) {
        super(props);
        this.state = {
            format: this.props.format,
        };
        this.input = React.createRef();
    }

    render() {
        let classes = classNames({
            "number-input": true,
            "invalid-input": !this._checkValidity(this.props.value),
            mini: this.props.size === "mini",
            small: this.props.size === "small",
            normal: this.props.size === "normal",
        });
        if (this.props.className != null) {
            classes = classes + " " + this.props.className;
        }

        return (
            <input
                //{...this.props}
                className={classes}
                type="text"
                ref={this.input}
                onChange={this._handleChange}
                onFocus={this._handleFocus}
                onBlur={this._handleBlur}
                onKeyPress={this._handleBlur}
                onKeyDown={this._onKeyDown}
                onTouchStart={captureScratchpadTouchStart}
                defaultValue={toNumericString(
                    this.props.value,
                    this.state.format
                )}
                value={undefined}
            />
        );
    }

    componentDidUpdate(prevProps) {
        if (!knumber.equal(this.getValue(), this.props.value)) {
            this._setValue(this.props.value, this.state.format);
        }
    }

    /* Return the current "value" of this input
     * If empty, it returns the placeholder (if it is a number) or null
     */
    getValue() {
        return this.parseInputValue(this.input.current.value);
    }

    /* Return the current string value of this input */
    getStringValue() {
        return this.input.current.value.toString();
    }

    parseInputValue(value) {
        if (value === "") {
            const placeholder = this.props.placeholder;
            return _.isFinite(placeholder) ? +placeholder : null;
        } else {
            const result = firstNumericalParse(value);
            return _.isFinite(result) ? result : this.props.value;
        }
    }

    /* Set text input focus to this input */
    focus() {
        this.input.current.focus();
        this._handleFocus();
    }

    blur() {
        this.input.current.blur();
        this._handleBlur();
    }

    setSelectionRange(selectionStart, selectionEnd) {
        ReactDOM.findDOMNode(this).setSelectionRange(
            selectionStart,
            selectionEnd
        );
    }

    getSelectionStart() {
        return ReactDOM.findDOMNode(this).selectionStart;
    }

    getSelectionEnd() {
        return ReactDOM.findDOMNode(this).selectionEnd;
    }

    _checkValidity(value) {
        if (value == null) {
            return true;
        }

        const val = firstNumericalParse(value);
        const checkValidity = this.props.checkValidity;

        return _.isFinite(val) && checkValidity(val);
    }

    _handleChange = (e) => {
        const text = e.target.value;
        const value = this.parseInputValue(text);
        const format = getNumericFormat(text);

        this.props.onChange(value);
        if (format) {
            this.props.onFormatChange(value, format);
            this.setState({format: format});
        }
    }

    _handleFocus = () => {
        if (this.props.onFocus) {
            this.props.onFocus();
        }
    }

    _handleBlur = (e) => {
        // Only continue on blur or "enter"
        if (e && e.type === "keypress" && e.keyCode !== 13) {
            return;
        }

        this._setValue(this.props.value, this.state.format);
        if (this.props.onBlur) {
            this.props.onBlur();
        }
    }

    _onKeyDown = (e) => {
        if (this.props.onKeyDown) {
            this.props.onKeyDown(e);
        }

        if (
            !this.props.useArrowKeys ||
            !_.contains(["ArrowUp", "ArrowDown"], e.key)
        ) {
            return;
        }

        let val = this.getValue();
        if (val !== Math.floor(val)) {
            return; // bail if not an integer
        }

        if (e.key === "ArrowUp") {
            val = val + 1;
        } else if (e.key === "ArrowDown") {
            val = val - 1;
        }

        if (this._checkValidity(val)) {
            this.props.onChange(val);
        }
    }

    _setValue = (val, format) => {
        this.input.current.value = toNumericString(val, format);
       /* $(this.input.current).val(
        );*/
    }
}

module.exports = NumberInput;
