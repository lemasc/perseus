/* ButtonGroup is an aesthetically pleasing group of buttons.
 *
 * The class requires these properties:
 *   buttons - an array of objects with keys:
 *     "value": this is the value returned when the button is selected
 *     "content": this is the JSX shown within the button, typically a string
 *         that gets rendered as the button's display text
 *     "title": this is the title-text shown on hover
 *   onChange - a function that is provided with the updated value
 *     (which it then is responsible for updating)
 *
 * The class has these optional properties:
 *   value - the initial value of the button selected, defaults to null.
 *   allowEmpty - if false, exactly one button _must_ be selected; otherwise
 *     it defaults to true and _at most_ one button (0 or 1) may be selected.
 *
 * Requires stylesheets/perseus-admin-package/editor.less to look nice.
 */

const React = require('react');
const ReactDOM = require("react-dom");
const createReactClass = require("create-react-class");
const PropTypes = require("prop-types");
const StyleSheet = require("aphrodite").StyleSheet;


const ButtonGroup = createReactClass({
    propTypes: {
        value: PropTypes.any,
        buttons: PropTypes.arrayOf(PropTypes.shape({
            value: PropTypes.any.isRequired,
            content: PropTypes.node,
            title: PropTypes.string,
        })).isRequired,
        onChange: PropTypes.func.isRequired,
        allowEmpty: PropTypes.bool,
    },

    getDefaultProps: function() {
        return {
            value: null,
            allowEmpty: true,
        };
    },

    focus: function() {
        ReactDOM.findDOMNode(this).focus();
        return true;
    },

    toggleSelect: function(newValue) {
        const value = this.props.value;

        if (this.props.allowEmpty) {
            // Select the new button or unselect if it's already selected
            this.props.onChange(value !== newValue ? newValue : null);
        } else {
            this.props.onChange(newValue);
        }
    },

    render: function() {
        const value = this.props.value;
        const style = StyleSheet.create({
            buttonStyle: {
                "border-radius": "0px",
                ':first-child': {
                    borderTopLeftRadius: '4px',
                    borderBottomLeftRadius: '4px',
                },
        
                ':last-child': {
                    borderTopRightRadius: '4px',
                    borderBottomRightRadius: '4px',
                }
            }
        });
        
        const buttons = this.props.buttons.map((button, i) => {
            return <button title={button.title}
                type="button"
                id={"" + i}
                style={style.buttonStyle}
                ref={"button" + i}
                key={"" + i}
                size="small"
                kind={button.value == value ? "primary" : "secondary"}
                onClick={this.toggleSelect.bind(this, button.value)}
            >
                {button.content || "" + button.value}
            </button>;
        });

        const outerStyle = {
            display: 'inline-block',
        };
        return <div style={outerStyle}>
            {buttons}
        </div>;
    },
});

module.exports = ButtonGroup;
