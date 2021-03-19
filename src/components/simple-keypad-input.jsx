const PropTypes = require('prop-types');
/**
 * A version of the `math-input` subrepo's KeypadInput component that adheres to
 * the same API as Perseus's  MathOuput and NumberInput, allowing it to be
 * dropped in as a replacement for those components without any modifications.
 *
 * TODO(charlie): Once the keypad API has stabilized, move this into the
 * `math-input` subrepo and use it everywhere as a simpler, keypad-coupled
 * interface to `math-input`'s MathInput component.
 */

const React = require("react");


const {components, consts, propTypes} = require("../../math-input");
const {KeypadInput} = components;
const {KeypadTypes} = consts;
const {keypadElementPropType} = propTypes;

class SimpleKeypadInput extends React.Component {
    static propTypes = {
        keypadElement: keypadElementPropType,
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
        onChange: PropTypes.func,
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
    }

    focus() {
        //this.props.onFocus();
        //this.refs.input.focus();
        this.props.keypadElement.activate();
    }

    blur() {
        //this.refs.input.blur();
        this.props.onBlur();
        this.props.keypadElement.dismiss();
    }

    getValue() {
        return this.props.value;
    }

    componentDidMount() {
        this._isMounted = true;
    }

    render() {
        // Intercept the `onFocus` prop, as we need to configure the keypad
        // before continuing with the default focus logic for Perseus inputs.
        // Intercept the `value` prop so as to map `null` to the empty string,
        // as the `KeypadInput` does not support `null` values.
        return (
            <KeypadInput
                ref="input"
                keypadElement={this.props.keypadElement}
                onFocus={() => {
                    console.log("FO");
                    if (this.props.keypadElement) {
                        console.log("k");
                        this.props.keypadElement.configure(
                            {
                                keypadType: KeypadTypes.FRACTION,
                            },
                            () => {
                                if (this._isMounted) {
                                    this.props.onFocus && this.props.onFocus();
                                }
                            }
                        );
                    } else {
                        this.props.onFocus && this.props.onFocus();
                    }
                }}
                onBlur={() => {
                    this.props.keypadElement.dismiss();
                    this.props.onBlur && this.props.onBlur();
                }}
                onChange={() => {this.props.onChange && this.props.onChange()}}
                value={this.props.value == null ? "" : "" + this.props.value}
            />
        );
    }
}

module.exports = SimpleKeypadInput;
