var PropTypes = require('prop-types');
/* eslint-disable comma-dangle, no-var, object-curly-spacing, react/jsx-closing-bracket-location, react/sort-comp, space-before-function-paren */
/* TODO(csilvers): fix these lint errors (http://eslint.org/docs/rules): */
/* To fix, remove an entry above, run ka-lint, and fix errors. */

var React = require("react");
var _ = require("underscore");

var Changeable = require("../mixins/changeable.jsx");
var EditorJsonify = require("../mixins/editor-jsonify.jsx");

var Editor = require("../editor.jsx");
var RangeInput = require("../components/range-input.jsx");

var Matrix = require("./matrix.jsx").widget;

// Really large matrices will cause issues with question formatting, so we
// have to cap it at some point.
var MAX_BOARD_SIZE = 6;

var getMatrixSize = function(matrix) {
    var matrixSize = [1, 1];

    // We need to find the widest row and tallest column to get the correct
    // matrix size.
    _.each(matrix,(matrixRow, row) => {
        var rowWidth = 0;
        _.each(matrixRow,(matrixCol, col) => {
            if (matrixCol != null && matrixCol.toString().length) {
                rowWidth = col + 1;
            }
        });

        // Matrix width:
        matrixSize[1] = Math.max(matrixSize[1], rowWidth);

        // Matrix height:
        if (rowWidth > 0) {
            matrixSize[0] = Math.max(matrixSize[0], row + 1);
        }
    });
    return matrixSize;
};

class MatrixEditor extends React.Component {
    static propTypes = {
        ...Changeable.propTypes,
        matrixBoardSize: PropTypes.arrayOf(PropTypes.number)
            .isRequired,
        answers: PropTypes.arrayOf(
            PropTypes.arrayOf(PropTypes.number)
        ),
        prefix: PropTypes.string,
        suffix: PropTypes.string,
        cursorPosition: PropTypes.arrayOf(PropTypes.number),
    }

    static defaultProps =  {
            matrixBoardSize: [3, 3],
            answers: [[]],
            prefix: "",
            suffix: "",
            cursorPosition: [0, 0],
        };

    render() {
        var matrixProps = _.extend(
            {
                numericInput: true,
                onBlur: () => {},
                onFocus: () => {},
                trackInteraction: () => {},
            },
            this.props
        );
        return (
            <div className="perseus-matrix-editor">
                <div className="perseus-widget-row">
                    {" "}Max matrix size:{" "}
                    <RangeInput
                        value={this.props.matrixBoardSize}
                        onChange={this.onMatrixBoardSizeChange}
                        format={this.props.labelStyle}
                        useArrowKeys={true}
                    />
                </div>
                <div className="perseus-widget-row">
                    <Matrix {...matrixProps} />
                </div>
                <div className="perseus-widget-row">
                    {" "}Matrix prefix:{" "}
                    <Editor
                        ref={"prefix"}
                        apiOptions={this.props.apiOptions}
                        content={this.props.prefix}
                        widgetEnabled={false}
                        onChange={newProps => {
                            this.change({prefix: newProps.content});
                        }}
                    />
                </div>
                <div className="perseus-widget-row">
                    {" "}Matrix suffix:{" "}
                    <Editor
                        ref={"suffix"}
                        apiOptions={this.props.apiOptions}
                        content={this.props.suffix}
                        widgetEnabled={false}
                        onChange={newProps => {
                            this.change({suffix: newProps.content});
                        }}
                    />
                </div>
            </div>
        );
    }

    change(...args) {
        return Changeable.change.apply(this, args);
    }

    onMatrixBoardSizeChange = (range) => {
        var matrixSize = getMatrixSize(this.props.answers);
        if (range[0] !== null && range[1] !== null) {
            range = [
                Math.round(Math.min(Math.max(range[0], 1), MAX_BOARD_SIZE)),
                Math.round(Math.min(Math.max(range[1], 1), MAX_BOARD_SIZE)),
            ];
            var answers = _.times(Math.min(range[0], matrixSize[0]),row => {
                return _.times(Math.min(range[1], matrixSize[1]),col => {
                    return this.props.answers[row][col];
                });
            });
            this.props.onChange({
                matrixBoardSize: range,
                answers: answers,
            });
        }
    }

    serialize() {
        return EditorJsonify.serialize.call(this);
    }
}

module.exports = MatrixEditor;
