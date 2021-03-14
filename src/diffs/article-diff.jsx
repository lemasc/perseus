const PropTypes = require('prop-types');
/**
 * A side by side diff view for Perseus articles.
 */

const React = require("react");
const _ = require("underscore");

const RendererDiff = require("./renderer-diff.jsx");

const rendererProps = PropTypes.shape({
    content: PropTypes.string,
    images: PropTypes.object,
    widgets: PropTypes.object,
});


class ArticleDiff extends React.Component {
    static propTypes = {
        // TODO(alex): Check whether we still have any Perseus articles whose
        // top-level json is an object, not an array. If not, simplify here.
        after: PropTypes.oneOfType([
            rendererProps,
            PropTypes.arrayOf(rendererProps),
        ]).isRequired,
        before: PropTypes.oneOfType([
            rendererProps,
            PropTypes.arrayOf(rendererProps),
        ]).isRequired,
    }

    getInitialState() {
        return this._stateFromProps(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.setState(this._stateFromProps(nextProps));
    }

    _stateFromProps(props) {
        const {before, after} = props;
        return {
            before: Array.isArray(before) ? before : [before],
            after: Array.isArray(after) ? after : [after],
        };
    }

    render() {
        const {before, after} = this.state;

        const sectionCount = Math.max(before.length, after.length);

        const sections = _.times(sectionCount, n =>
            <RendererDiff
                before={n < before.length ? before[n] : undefined}
                after={n < after.length ? after[n] : undefined}
                title={`Section ${n + 1}`}
                showAlignmentOptions={true}
                showSeparator={n < sectionCount - 1}
                key={n}
            />
        );

        return <div className="framework-perseus">{sections}</div>;
    }
}

module.exports = ArticleDiff;
