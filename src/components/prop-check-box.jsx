const PropTypes = require('prop-types');
/* eslint-disable react/prop-types, react/sort-comp */

const React = require("react");
const _ = require("underscore");

/* A checkbox that syncs its value to props using the
 * renderer's onChange method, and gets the prop name
 * dynamically from its props list
 */
class PropCheckBox extends React.Component {
    constructor(props) {
        super(props);
    }
    static propTypes = {
        labelAlignment: PropTypes.oneOf(["left", "right"]),
    }

    static defaultProps = {
        label: null,
        onChange: null,
        labelAlignment: "left",
    }
    _defaults = {
        label: null,
        onChange: null,
        labelAlignment: "left",
    }
    propName = () => {
        const propName = _.find(
            _.keys(this.props),
            (localPropName) => {
                return !_.has(this._defaults, localPropName);
            },
            this
        );

        if (!propName) {
            throw new Error(
                "Attempted to create a PropCheckBox with no prop!"
            );
        }

        return propName;
    }

    _labelAlignLeft = () => {
        return this.props.labelAlignment === "left";
    }

    render() {
        const propName = this.propName();
        return (
            <label>
                {this._labelAlignLeft() && this.props.label}
                <input
                    type="checkbox"
                    checked={this.props[propName]}
                    onChange={this.toggle}
                />
                {!this._labelAlignLeft() && this.props.label}
            </label>
        );
    }

    toggle = () => {
        const propName = this.propName();
        const changes = {};
        changes[propName] = !this.props[propName];
        this.props.onChange(changes);
    }
}

module.exports = PropCheckBox;
