const NAME_HEADER = 'name'
const TYPE_HEADER = 'type'
const VALUE_HEADER = 'value'
const KEY_SEPARATOR = '.'
const OBJECT_TYPE = 'object'
const STRING_TYPE = 'string'
const NUMBER_TYPE = 'number'
const ARRAY_REGEX = /\[\]$/
const EMPTY_STR = ''

function toJson(table) {
    const fields = getFields(table)
    const object = buildObject(fields)
    return JSON.stringify(object, null, 4)
}

function getFields(matrix) {
    const fields = []
    matrix.forEach((row, y) => {
        if (y !== 0) {
            const field = {}
            row.forEach((cell, x) => {
                switch (matrix[0][x]) {
                    case VALUE_HEADER:
                        field.value = cell
                        break
                    case TYPE_HEADER:
                        field.type = cell
                        break
                    case NAME_HEADER:
                    default:
                        field.type = cell
                        field.path = cell.split(KEY_SEPARATOR)
                        break
                }
            })
            fields.push(field)
        }
    })
    return fields
}

function buildObject(fields) {
    const FIRST_LEVEL = 0
    let objectRoot = {}
    let treeIndex = []
    fields.forEach(
        field => (objectRoot = getTree(FIRST_LEVEL, objectRoot, treeIndex, field))
    )
    return objectRoot
}

// TODO los nombre con corchetes crean arreglos
// TODO los nombre repetidos crean nuevos objetos
function getTree(level, root, index, field) {
    const key = field.path[level]
/*    if (ARRAY_REGEX.test(key)) {
        const arrayKey = key.replace(ARRAY_REGEX, EMPTY_STR)
        if (root[arrayKey] === undefined) {
            root[arrayKey] = []
        }
        if (root[arrayKey][0] === undefined) {
            root[arrayKey][0] = []
        }
        root[arrayKey][0] = getTree(level + 1, root[arrayKey][0], index, field)
    } else {*/
        if (level === field.path.length - 1) {
            root[key] = getValue(field)
        } else {
            if (root[key] === undefined) {
                root[key] = {}
            }
            root[key] = getTree(level + 1, root[key], index, field)
        }
        return root
    // }
}

function getValue({type, value}) {
    switch (type) {
        case NUMBER_TYPE:
            return Number(value)
        case STRING_TYPE:
            return String(value)
        case OBJECT_TYPE:
            return {}
        default:
            return value
    }
}
