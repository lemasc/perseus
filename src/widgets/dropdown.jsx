/* eslint-disable comma-dangle, no-var, react/jsx-closing-bracket-location, react/jsx-indent-props, react/sort-comp */
/* TODO(csilvers): fix these lint errors (http://eslint.org/docs/rules): */
/* To fix, remove an entry above, run ka-lint, and fix errors. */

const { StyleSheet, css } = require("aphrodite");
const classNames = require("classnames");
const PropTypes = require('prop-types');
const React = require("react");
const ReactDOM = require("react-dom");
const _ = require("underscore");

const ApiClassNames = require("../perseus-api.jsx").ClassNames;
const ApiOptions = require("../perseus-api.jsx").Options;
const InlineIcon = require("../components/inline-icon.jsx");
const styleConstants = require("../styles/constants.js");

const { iconDropdownArrow } = require("../icon-paths.js");

const dropdownArrowSize = 24;

class Dropdown extends React.Component {
    static propTypes = {
        apiOptions: ApiOptions.propTypes,
        choices: PropTypes.arrayOf(PropTypes.string),
        onChange: PropTypes.func.isRequired,
        placeholder: PropTypes.string,
        selected: PropTypes.number,
        trackInteraction: PropTypes.func.isRequired,
    }

    static defaultProps = {
        choices: [],
        selected: 0,
        placeholder: "",
        apiOptions: ApiOptions.defaults,
    };
    constructor(props) {
        super(props);
        this.state = {
            visible: false
        }
    }

    componentDidMount() {
        if(this.props.apiOptions.isMobile) {
            document.addEventListener("touchstart", this.clickTarget)
        }
        document.addEventListener("click", this.clickTarget)
    }
    componentWillUnmount() {
        document.removeEventListener("click", this.clickTarget);
        if(this.props.apiOptions.isMobile) {
            document.removeEventListener("touchstart", this.clickTarget);
        }
    }
    clickTarget = (e) => {
        if (!e.target.closest(".perseus-widget-dropdown") && this.state.visible) {
                this.toggleDropDown();
        }
    }
    toggleDropDown = () => {
        this.setState({ visible: !this.state.visible })
    }
    setValue = (e) => {
        this._handleChange(parseInt(e.target.dataset.value));
        this.toggleDropDown();
    }
    calculateWidth(choices) {
        choices.push(this.props.placeholder); //Placeholder also need to calculate
        let maxwidth = choices.reduce((i, d,) => {
            const $test = $("<span>").text(d).appendTo("body");
            const width = $test.width();
            $test.remove();
            return Math.max(i, width);
        }, 0);
        return maxwidth + dropdownArrowSize + 10;
    }
    render() {
        var choices = this.props.choices.slice();
        let items;
        if (this.state.visible) {
            items = <div className={css(styles.options)}>
                {choices.map((choice, i) => {
                    return (
                        <span className={css(styles.item, (this.props.selected == i + 1 && styles.itemSelected))} onClick={this.setValue} key={"" + (i + 1)} data-value={i + 1}>
                            {choice}
                        </span>
                    );
                })}
            </div>;
        }
        return (
            <div className={"perseus-widget-dropdown " + ApiClassNames.INTERACTIVE}>
                <div className={css(styles.toggle)}>
                    <button
                        onClick={e => {
                            if(!this.props.apiOptions.isMobile) {
                                this.toggleDropDown();
                            }
                        }}
                        onTouchStart={e => {
                            this.toggleDropDown();
                        }}
                        className={
                            css(styles.dropdown, styles.button)
                        }
                        style={{
                            width: this.calculateWidth(choices)
                        }}
                        disabled={this.props.apiOptions.readOnly}
                    >
                        {this.props.selected == 0 ? this.props.placeholder : choices[this.props.selected - 1]}
                    </button>
                    <InlineIcon
                        {...iconDropdownArrow}
                        style={{
                            marginLeft: `-${dropdownArrowSize}px`,
                            height: dropdownArrowSize,
                            width: dropdownArrowSize,
                        }}
                    />
                </div>
                {items}
            </div>
        );
    }

    focus = () => {
        ReactDOM.findDOMNode(this).focus();
        return true;
    }

    _handleChange = (selected) => {
        console.log(selected);
        this.props.trackInteraction();
        this.props.onChange({ selected: selected });
    }

    getUserInput = () => {
        return { value: this.props.selected };
    }

    simpleValidate = (rubric) => {
        return Dropdown.validate(this.getUserInput(), rubric);
    }
}

_.extend(Dropdown, {
    validate: function (state, rubric) {
        var selected = state.value;
        if (selected === 0) {
            return {
                type: "invalid",
                message: null,
            };
        } else {
            var correct = rubric.choices[selected - 1].correct;
            return {
                type: "points",
                earned: correct ? 1 : 0,
                total: 1,
                message: null,
            };
        }
    },
});

var propTransform = editorProps => {
    return {
        placeholder: editorProps.placeholder,
        choices: _.map(editorProps.choices, choice => choice.content),
    };
};

const styles = StyleSheet.create({
    dropdown: {
        padding: `9px ${dropdownArrowSize + 1}px 9px 9px`,
        backgroundColor: "white",
        border: `1px solid ${styleConstants.gray76}`,
        borderRadius: 4,
    },
    button: {
        boxShadow: "none",
        fontFamily: styleConstants.baseFontFamily,
        cursor: "pointer",
        height: "37px",

        ":focus": {
            outline: "none",
            border: `2px solid ${styleConstants.kaGreen}`,
            padding: `8px ${dropdownArrowSize}px 8px 8px`,
        },

        ":focus + svg": {
            color: `${styleConstants.kaGreen}`,
        },

        ":disabled": {
            color: styleConstants.gray68,
        },

        ":disabled + svg": {
            color: styleConstants.gray68,
        },
    },
    toggle: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    options: {
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${styleConstants.gray76}`,
        borderRadius: 4,
    },
    item: {
        background: "white",
        height: "19px",
        cursor: "pointer",
        padding: `9px ${dropdownArrowSize + 1}px 9px 9px`,
        ":hover": {
            backgroundColor: styleConstants.gray90
        }
    },
    itemSelected: {
        backgroundColor: styleConstants.kaGreen,
        color: "white"
    }
});

module.exports = {
    name: "dropdown",
    displayName: "Drop down",
    defaultAlignment: "inline-block",
    accessible: true,
    widget: Dropdown,
    transform: propTransform,
};
