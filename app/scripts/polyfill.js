// String.endsWith()
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(searchString, position) {
        var subjectString = this.toString();
        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.lastIndexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}

// Array.pushUnique()
if (!Array.prototype.pushUnique) {
    Array.prototype.pushUnique = function(item, individually) {
        if (item) {
            if (individually) {
                for (var i = 0; i < item.length; i++) {
                    var individualItem = item[i];
                    if (individualItem) {
                        if (this.indexOf(individualItem) == -1) {
                            this.push(individualItem);
                        }
                    }
                }
            } else {
                if (this.indexOf(item) == -1) {
                    this.push(item);
                }
            }
        }
    };
}
