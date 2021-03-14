const PropTypes = require('prop-types');
/* eslint-disable react/sort-comp */

const React = require("react");

const ReactDOM = require("react-dom");

class TextInput extends React.Component {
    static propTypes = {
        value: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string,
        labelText: PropTypes.string,
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
        disabled: PropTypes.bool,
    }

    static defaultProps = {
            value: "",
            disabled: false
    }

    render() {
        const {labelText, ...props} = this.props;
        return (
            <input
                {...props}
                type="text"
                aria-label={labelText}
                onChange={e => this.props.onChange(e.target.value)}
            />
        );
    }

    focus() {
        ReactDOM.findDOMNode(this).focus();
    }

    blur() {
        ReactDOM.findDOMNode(this).blur();
    }

    getValue() {
        return ReactDOM.findDOMNode(this).value;
    }

    getStringValue() {
        return ReactDOM.findDOMNode(this).value.toString();
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
}

module.exports = TextInput;
