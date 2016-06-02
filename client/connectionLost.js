module.exports = function connectionLost() {
  if (!!document.getElementById('pingyConnectionLost')) return

  var style = 'position: fixed; top: 0px; left: 0px; background: rgba(220, 220, 220, 0.9);'
  style += 'width: 100%; padding: 20px; text-align: center; border-bottom: 1px #555 solid;'
  style += 'z-index: 9999; text-shadow: 1px 1px 0px white;'

  var div = document.createElement('div')
  div.id = 'pingyConnectionLost'
  div.innerHTML = 'Pingy has lost contact with this page. You will need to refresh the page to get Instant Reload working again.'
  div.style = style
  document.body.appendChild(div)
}
