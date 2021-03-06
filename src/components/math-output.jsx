const PropTypes = require('prop-types');
/* eslint-disable react/sort-comp */

const React = require("react");
const ReactDOM = require("react-dom");
const _ = require("underscore");
const TeX = require("./tex.jsx");
const ApiClassNames = require("../perseus-api.jsx").ClassNames;
const ModifyTex = require("../tex-wrangler.js").modifyTex;

class MathOutput extends React.Component {
    static propTypes = {
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
        className: PropTypes.string,
        labelText: PropTypes.string,
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
    }

    getDefaultProps() {
        return {
            value: "",
            onFocus() {},
            onBlur() {}
        };
    }

    getInitialState() {
        return {
            focused: false,
            selectorNamespace: _.uniqueId("math-output"),
        };
    }

    _getInputClassName() {
        let className =
            "math-output " +
            ApiClassNames.INPUT +
            " " +
            ApiClassNames.INTERACTIVE;
        if (this.state.focused) {
            className += " " + ApiClassNames.FOCUSED;
        }
        if (this.props.className) {
            className += " " + this.props.className;
        }
        return className;
    }

    _getDisplayValue(value) {
        // Cast from (potentially a) number to string
        let displayText;
        if (value != null) {
            displayText = "" + value;
        } else {
            displayText = "";
        }
        return ModifyTex(displayText);
    }

    render() {
        const divStyle = {
            textAlign: "center",
        };

        return (
            <span
                ref="input"
                className={this._getInputClassName()}
                aria-label={this.props.labelText}
                onMouseDown={this.focus}
                onTouchStart={this.focus}
            >
                <div style={divStyle}>
                    <TeX>
                        {this._getDisplayValue(this.props.value)}
                    </TeX>
                </div>
            </span>
        );
    }

    getValue() {
        return this.props.value;
    }

    focus() {
        if (!this.state.focused) {
            this.props.onFocus();
            this._bindBlurHandler();
            this.setState({
                focused: true,
            });
        }
    }

    blur() {
        if (this.state.focused) {
            this.props.onBlur();
            this._unbindBlurHandler();
            this.setState({
                focused: false,
            });
        }
    }

    _bindBlurHandler() {
        $(document).bind("vclick." + this.state.selectorNamespace, e => {
            // Detect whether the target has our React DOM node as a parent
            const $closestWidget = $(e.target).closest(
                ReactDOM.findDOMNode(this)
            );
            if (!$closestWidget.length) {
                this.blur();
            }
        });
    }

    _unbindBlurHandler() {
        $(document).unbind("." + this.state.selectorNamespace);
    }

    componentWillUnmount() {
        this._unbindBlurHandler();
    }
}

module.exports = MathOutput;
