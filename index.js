const robots = {
  input: require('./robots/input.js'),
  text: require('./robots/text.js'),
  image: require('./robots/image.js'),
  post: require('./robots/post.js')
}

async function start() {
  await robots.input()
  await robots.text()
  await robots.image()
  await robots.post()
}

start()
