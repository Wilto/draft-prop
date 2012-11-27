test(function() {
    var img = new Image(''),
        result;
    img.setAttribute('srcset', '');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, null);
    assert_equals(result.density, undefined);
}, 'If candidates is empty, return null and undefined.');
test(function() {
    var img = new Image(''),
        result;
    img.setAttribute('srcset', '\t \t\r\f\f\r \n \t');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, null);
    assert_equals(result.density, undefined);
}, 'Ignore whitespace as the attribute value.');
test(function() {
    var img = new Image(''),
        result;
    img.setAttribute('srcset', 'pass 1x, fail 1x');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, 'pass');
    assert_equals(result.density, 1);
}, 'Ignore duplicates, even if the url is different.');
test(function() {
    var img = new Image(''),
        result;
    img.setAttribute('srcset', 'pass 0002.000x, b 02x, b 02.0000x, fail 2x');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, 'pass');
    assert_equals(result.density, 2);
}, 'Ignore a long list of duplicates with different densities.');
test(function() {
    var img = new Image(''),
        result;
    img.setAttribute('srcset', 'pass 0002.000h, a 02h, c 02.0000h, fail 2h');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, 'pass');
    assert_equals(result.density, 1);
}, 'Ignore a long list of duplicates with the same heights.');
test(function() {
    var img = new Image(''),
        result;
    img.setAttribute('srcset', 'pass 0002.000h 01w 1x, a 02h 001w, c 02.0000h, fail 2h 001w 1x');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, 'pass');
    assert_equals(result.density, 1);
}, 'Ignore a long list of duplicates with the same width and height and density.');
test(function() {
    var img = new Image(''),
        result;
    img.setAttribute('srcset', 'fail 0002h 01w 1x, a 02h 001w 1x, c 02h 0001w 1x, fail 2h 001w 1x, pass 2000w');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, 'pass');
    assert_equals(result.density, 1);
}, 'Ignore a long list of duplicates with the same width and height and density.');
test(function() {
    var img = new Image(''),
        result;
    img.setAttribute('srcset', 'fail 0002h 01w 1x, a 02h 001w 1x, c 02h 0001w 1x, fail 2h 001w 1x, pass 2000w');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, 'pass');
    assert_equals(result.density, 1);
}, 'Ignore a long list of duplicates with the same width and height and density.');
test(function() {
    var img = new Image(''),
        result;
    img.setAttribute('src', 'pass');
    img.setAttribute('srcset', '\t \t\r\f\f\r \n \t');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, 'pass');
    assert_equals(result.density, 1);
}, 'Test that src attribute is selected as the candidate when srcset is empty.');
test(function() {
    var img = new Image(''),
        result;
    img.setAttribute('src', 'pass');
    img.setAttribute('srcset', 'fail 1w, fail 2w, fail 3w');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, 'pass');
    assert_equals(result.density, 1);
}, 'Test that src attribute is selected as a candidate.');
test(function() {
    var img = new Image(''),
        result;
    img.setAttribute('src', 'fail_src');
    img.setAttribute('srcset', 'fail1 1w, pass 2000w, fail2 2000w, fail3 3w');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, 'pass');
    assert_equals(result.density, 1);
}, 'Test that src attribute is not selected as a candidate.');
test(function() {
    var img = new Image(''),
        result;
    img.setAttribute('src', 'fail_src');
    img.setAttribute('srcset', 'pass 2000w, fail1 3000w, fail2 4000w');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, 'pass');
    assert_equals(result.density, 1);
}, 'Test selection of smallest large width.');
test(function() {
    var img = new Image(''),
        result;
    img.setAttribute('src', 'fail_src');
    img.setAttribute('srcset', 'pass 2000h, fail1 3000h, fail2 4000h');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, 'pass');
    assert_equals(result.density, 1);
}, 'Test selection of smallest large height.');
test(function() {
    var img = new Image(''),
        result;
    img.setAttribute('src', 'fail_src');
    img.setAttribute('srcset', 'fail1 3000h, fail2 4000h, pass 2000h');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, 'pass');
    assert_equals(result.density, 1);
}, 'Test selection of smallest large height.');
test(function() {
    var img = new Image(''),
        result;
    img.setAttribute('src', 'fail_src');
    img.setAttribute('srcset', 'fail1 3000h, fail2 4000h, pass 2000h, fail1 3000h, fail 2000h, fail2 4000h');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, 'pass');
    assert_equals(result.density, 1);
}, 'Test selection of smallest large height, with redudant values.');
test(function() {
    var img = new Image(''),
        result,
        width = window.innerWidth + 'w';
    img.setAttribute('src', 'fail_src');
    img.setAttribute('srcset', 'pass ' + width, 'fail ' + width);
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, 'pass');
    assert_equals(result.density, 1);
}, "Test selection of the right source when window\'s width is the same as the source.");
test(function() {
    var img = new Image(''),
        result,
        height = window.innerHeight;
    img.setAttribute('src', 'fail_src');
    img.setAttribute('srcset', 'pass ' + height + 'h', 'fail ' + (height - 1) + 'h', 'fail ' + (height + 1) + 'h');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, 'pass');
    assert_equals(result.density, 1);
}, "Test selection of the right source when window\'s width is the same as the source and other bigger and smaller sources are available.");
test(function() {
    var img = new Image(''),
        result,
        height = window.innerHeight;
    img.setAttribute('src', 'fail_src');
    img.setAttribute('srcset', 'pass ' + height + 'h', 'fail ' + (height - 1) + 'h', 'fail ' + (height + 1) + 'h');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, 'pass');
    assert_equals(result.density, 1);
}, 'Test selection of the right source when window\'s height is the same as the source and other bigger and smaller sources are available.');
test(function() {
    var img = new Image(''),
        result,
        height = window.innerHeight;
    img.setAttribute('src', 'fail');
    img.setAttribute('srcset', 'fail ' + (0 - height) + 'h, pass ' + height + 'h, fail -x');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, 'pass');
    assert_equals(result.density, 1);
}, 'Test that parser ignores negative height');
test(function() {
    var img = new Image(''),
        result,
        width = window.innerWidth;
    img.setAttribute('src', 'fail');
    img.setAttribute('srcset', 'fail ' + (0 - width) + 'w, pass ' + width + 'w, fail -x');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, 'pass');
    assert_equals(result.density, 1);
}, 'Test that parser ignores negative width');
test(function() {
    var img = new Image(''),
        result;
    img.setAttribute('srcset', 'fail 2x, pass 1x 2x 3x 4x 5x 6x, fail 2x 2x 2x 1x');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, 'pass');
    assert_equals(result.density, 1);
}, 'Test that duplicated desciptors are handled correctly');
test(function() {
    var img = new Image(''),
        result;
    img.setAttribute('srcset', 'fail');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, null);
    assert_equals(result.density, undefined);
}, 'test that a single URL with no descriptors is ignored.');
test(function() {
    var img = new Image(''),
        result;
    img.setAttribute('srcset', ' , , , ');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, null);
    assert_equals(result.density, undefined);
}, 'test that empty descriptors are handled correclty');
test(function() {
    var img = new Image(''),
        result;
    img.setAttribute('srcset', ', 2x, fail');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, ',');
    assert_equals(result.density, 2);
}, 'test that empty descriptors are handled correclty');
test(function() {
    var img = new Image(''),
        result;
    img.setAttribute('srcset', ', 2x, pass 1x');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, 'pass');
    assert_equals(result.density, 1);
}, 'test that empty descriptors are handled correclty');
test(function() {
    var img = new Image(''),
        result;
    img.setAttribute('srcset', 'pass 5x 1x');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, 'pass');
    assert_equals(result.density, 5);
}, 'test that empty descriptors are handled correclty');
test(function() {
    var img = new Image(''),
        result,
        width = window.innerWidth,
        value = 'fail 1w ' + width + 'w, pass ' + width + 10 + 'w, fail 2w ' + width + 'w';
    img.setAttribute('src', 'fail');
    img.setAttribute('srcset', value);
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, 'pass');
    assert_equals(result.density, 1);
}, 'Test the parser ignores subsequent descriptors');
test(function() {
    var img = new Image(''),
        result;
    img.setAttribute('srcset', ', 2x, pass 1x');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, 'pass');
    assert_equals(result.density, 1);
}, 'test that empty descriptors are handled correclty');
test(function() {
    var img = new Image(''),
        result;
    img.setAttribute('srcset', 'pass -1.0x');
    result = window.srcsetParser.parse(img.getAttributeNode('srcset'));
    assert_equals(result.url, 'pass');
    assert_equals(result.density, -1.0);
}, 'test negative density');
