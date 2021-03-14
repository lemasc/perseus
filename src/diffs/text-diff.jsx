const classNames = require("classnames");
const PropTypes = require('prop-types');
const React = require("react");
const _ = require("underscore");

const diff = require("../../lib/jsdiff");
const splitDiff = require("./split-diff.jsx");
const stringArrayDiff = require("./string-array-diff.jsx");
const SvgImage = require("../components/svg-image.jsx");


const BEFORE = "before";
const AFTER = "after";

const IMAGE_REGEX = /http.*?\.png|web\+graphie[^)]*/g;

const imagesInString = function(str) {
    return str.match(IMAGE_REGEX) || [];
};

const classFor = function(entry, ifAdded, ifRemoved) {
    if (entry.added) {
        return ifAdded;
    } else if (entry.removed) {
        return ifRemoved;
    } else {
        return "";
    }
};

class ImageDiffSide extends React.Component {
    static propTypes = {
        images: PropTypes.arrayOf(PropTypes.shape({})).isRequired,

    }

    render() {
        return <div>


            {_.map(this.props.images, (entry, index) => {
                const className = classNames({
                    "image": true,
                    "image-unchanged": entry.status === "unchanged",
                    "image-added": entry.status === "added",
                    "image-removed": entry.status === "removed",
                });
                return <div key={index} >
                    <div className={className}>
                        <SvgImage src={entry.value} title={entry.value} />
                    </div>
                </div>;
            })}
        </div>;
    }
}

class TextDiff extends React.Component {
    static propTypes = {
        after: PropTypes.string,
        before: PropTypes.string,
        title: PropTypes.string.isRequired,
    }

    getDefaultProps() {
        return {
            after: "",
            before: "",
        };
    }

    getInitialState() {
        return {
            collapsed: this.props.before === this.props.after,
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            collapsed: nextProps.before === nextProps.after,
        });
    }

    handleExpand() {
        this.setState({collapsed: false});
    }

    render() {
        const diffed = diff.diffWords(this.props.before, this.props.after);

        const lines = splitDiff(diffed);

        const beforeImages = imagesInString(this.props.before);
        const afterImages = imagesInString(this.props.after);
        const images = stringArrayDiff(beforeImages, afterImages);

        const renderedLines = _.map(lines, (line) => {
            const contents = {};

            contents.before = _.map(line,function(entry, i) {
                return <span
                    key={i}
                    className={classFor(entry, "not-present", "removed dark")}
                >
                    {entry.value}
                </span>;
            });

            contents.after = _.map(line,function(entry, i) {
                return <span
                    key={i}
                    className={classFor(entry, "added dark", "not-present")}
                >
                    {entry.value}
                </span>;
            });

            return contents;
        });

        const className = classNames({
            "diff-row": true,
            "collapsed": this.state.collapsed,
        });

        return <div>
            <div className="diff-header">{this.props.title}</div>
            <div className="diff-header">{this.props.title}</div>
            <div className="diff-body ui-helper-clearfix">
                {_.map([BEFORE, AFTER], (side, index) => {
                    return <div className={"diff-row " + side} key={index}>
                        {!this.state.collapsed &&
                            _.map(renderedLines, (line, lineNum) => {
                                const changed = line[side].length > 1;
                                const lineClass = classNames({
                                    "diff-line": true,
                                    "added": side === AFTER && changed,
                                    "removed": side === BEFORE && changed,
                                });
                                return <div
                                    className={lineClass}
                                    key={lineNum}
                                >
                                    {line[side]}
                                </div>;
                            })}
                         {!this.state.collapsed &&
                             <ImageDiffSide images={images[side]} />}
                    </div>;
                })}
            </div>
            {_.map([BEFORE, AFTER], (side, index) => {
                return <div
                    className={className + " " + side}
                    key={index}
                    onClick={this.handleExpand}
                >
                    {this.state.collapsed &&
                    <span>
                        <span className="expand-button" >
                            {" "}[ show unmodified ]
                        </span>
                    </span>}
                </div>;
            })}
        </div>;
    }
}

module.exports = TextDiff;
