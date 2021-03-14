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

/*
const {components, consts, propTypes} = require("../../math-input");
const {KeypadInput} = components;
const {KeypadTypes} = consts;
const {keypadElementPropType} = propTypes;*/

//TODO: get anyway to restore this to works; idk;

class SimpleKeypadInput extends React.Component {
    static propTypes = {
      //  keypadElement: keypadElementPropType,
        onFocus: PropTypes.func,
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
    }

    focus() {
        this.refs.input.focus();
       // this.keypadElement.activate();
    }

    blur() {
        this.refs.input.blur();
      //  this.keypadElement.dismiss();
    }

    getValue() {
        return this.props.value;
    }

    render() {
        // Intercept the `onFocus` prop, as we need to configure the keypad
        // before continuing with the default focus logic for Perseus inputs.
        // Intercept the `value` prop so as to map `null` to the empty string,
        // as the `KeypadInput` does not support `null` values.
        const {keypadElement, onFocus, value, ...rest} = this.props;
        return <input
                    value={value == null ? "" : "" + value}
                    onFocus={ onFocus ? onFocus() : () => {}}
                    onChange={console.log}
                    {...rest} />
/*
        return (
            <KeypadInput
                ref="input"
                keypadElement={keypadElement}
                onFocus={() => {
                    if (keypadElement) {
                        keypadElement.configure(
                            {
                                keypadType: KeypadTypes.FRACTION,
                            },
                            () => {
                                if (this.isMounted()) {
                                    onFocus && onFocus();
                                }
                            }
                        );
                    } else {
                        onFocus && onFocus();
                    }
                }}
                value={value == null ? "" : "" + value}
                {...rest}
            />
        );*/
    }
}

module.exports = SimpleKeypadInput;
