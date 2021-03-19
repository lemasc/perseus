var PropTypes = require('prop-types');
/* eslint-disable comma-dangle, no-var, react/sort-comp */
/* TODO(csilvers): fix these lint errors (http://eslint.org/docs/rules): */
/* To fix, remove an entry above, run ka-lint, and fix errors. */

var React = require("react");
var _ = require("underscore");

var EditorPage = require("./editor-page.jsx");

/* Renders an EditorPage (or an ArticleEditor) as a non-controlled component.
 *
 * Normally the parent of EditorPage must pass it an onChange callback and then
 * respond to any changes by modifying the EditorPage props to reflect those
 * changes. With StatefulEditorPage changes are stored in state so you can
 * query them with serialize.
 */
class StatefulEditorPage extends React.Component {
    static propTypes = {
        componentClass: PropTypes.func,
    }
    
    static defaultProps = {
        componentClass: EditorPage,
    };

    constructor(props) {
        super(props);
        this.state = _.extend(_.omit(this.props, "componentClass"), {
            onChange: this.handleChange,
            ref: (ref) => this.editor = ref,
        });
    }

    render() {
        return <this.props.componentClass {...this.state} />;
    }

    // getInitialState isn't called if the react component is re-rendered
    // in-place on the dom, in which case this is called instead, so we
    // need to update the state here.
    // (This component is currently re-rendered by the "Add image" button.)
    static getDerivedStateFromProps(nextProps, prevState) {
        return _.pick(nextProps,
            "apiOptions",
            "imageUploader",
            "developerMode",
            "problemNum",
            "previewDevice"
        )
    }

    getSaveWarnings() {
        return this.editor.getSaveWarnings();
    }

    serialize() {
        return this.editor.serialize();
    }

    handleChange = (newState, cb) => {
        this.setState(newState, cb);
    }

    scorePreview() {
        return this.editor.scorePreview();
    }
}

module.exports = StatefulEditorPage;
