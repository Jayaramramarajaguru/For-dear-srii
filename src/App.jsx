import { useState, useEffect, useRef, useCallback } from 'react'

// Types out `text` one character at a time. Resets and restarts whenever
// `text` changes — which also means it replays automatically every time
// its slide is re-mounted (i.e. every time you swipe back to that page).
function useTypewriter(text, speed = 24) {
  const [out, setOut] = useState('')
  useEffect(() => {
    setOut('')
    let i = 0
    const id = setInterval(() => {
      i += 1
      setOut(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])
  return out
}

const QUOTES = [
  "Best friends don't finish each other's sentences — they just already know the ending.",
  "Some people come with an expiry date. You came with a 'forever' attached.",
  "If forever needed a face, it would probably look a lot like you, laughing at your own joke.",
  "Not everyone finds a person. I got lucky and found mine.",
  "You're the friendship I'd pick again, in every version of this life.",
  "Distance, time, bad days — none of it has ever been a match for us.",
]

// public/photos/1.jpg .. 4.jpg already contain her photos.
// Edit the captions below to whatever you want each photo to say.
const PHOTOS = [
  { src: '1.jpg', caption: 'That half-smile you give when you\u2019re pretending not to smile at all.' },
  { src: '2.jpg', caption: 'Silly filters, real happiness \u2014 my favourite kind of you.' },
  { src: '3.jpg', caption: 'Even sideways and goofy, still the best part of my day.' },
  { src: '4.jpg', caption: 'Trying to look cool, failing only because you\u2019re too cute for it.' },
]

const PROMISES = [
  'I\u2019ll be the first call when something good happens to you.',
  'I\u2019ll sit with you in the hard days, not just the easy ones.',
  'Your tears get a safe place here, no explanations needed.',
  'Your laugh is one of my favourite sounds \u2014 I\u2019ll keep earning it.',
  'Distance, time, bad days \u2014 none of it changes us.',
  'Whatever life throws, we face it as us, not just me and you.',
]

function PhotoFrame({ src }) {
  const [failed, setFailed] = useState(false)
  return failed ? (
    <div className="photo-fallback">
      <span>📷</span>
      <small>add {src}</small>
    </div>
  ) : (
    <img className="photo" src={`/photos/${src}`} alt="" onError={() => setFailed(true)} />
  )
}

function HeroSlide() {
  return (
    <div className="slide hero-slide">
      <span className="hero-monkey" aria-hidden="true">🐒</span>
      <p className="eyebrow">for</p>
      <h1 className="name">Sri</h1>
      <p className="nickname">my favourite person</p>
      <p className="tagline">support. smile. cry. console. forever.</p>
      <p className="hint">swipe or tap the arrow →</p>
    </div>
  )
}

const LETTER_PARTS = [
  "my dear srii 🐒💗",
  'Somewhere between all our ordinary days, you quietly became the person I look for first in every room.',
  "I want to be the one who shows up. On the days you're laughing too hard to breathe, and on the days you can't explain why you're crying — both versions of you get all of me, no questions asked.",
  "We have each other. That's not a small thing. For me, honestly, it might be the whole thing.",
]
const LETTER_TEXT = LETTER_PARTS.join('\n\n')

function LetterSlide() {
  const typed = useTypewriter(LETTER_TEXT, 14)
  const done = typed.length >= LETTER_TEXT.length
  const paragraphs = typed.split('\n\n')
  return (
    <div className="slide">
      <div className="card letter">
        {paragraphs.map((p, i) => (
          <p key={i}>
            {p}
            {!done && i === paragraphs.length - 1 && <span className="caret" />}
          </p>
        ))}
        {done && <p className="signature">— always in your corner</p>}
      </div>
    </div>
  )
}

const PROMISES_TEXT = PROMISES.join('\n')

function PromisesSlide() {
  const typed = useTypewriter(PROMISES_TEXT, 12)
  const done = typed.length >= PROMISES_TEXT.length
  const lines = typed.split('\n')
  return (
    <div className="slide">
      <p className="slide-label">what "we have each other" means</p>
      <ul className="promises">
        {lines.map((line, i) => (
          <li key={i}>
            <span className="check">✓</span>
            <span>
              {line}
              {!done && i === lines.length - 1 && <span className="caret" />}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function GallerySlide() {
  const [i, setI] = useState(0)
  const touchX = useRef(null)

  const goPhoto = (dir) => {
    setI((v) => Math.min(Math.max(v + dir, 0), PHOTOS.length - 1))
  }

  // stopPropagation so swiping inside the gallery moves photos,
  // not the main hero/letter/... pages behind it.
  const onTouchStart = (e) => {
    e.stopPropagation()
    touchX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e) => {
    e.stopPropagation()
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 40) goPhoto(dx < 0 ? 1 : -1)
    touchX.current = null
  }

  const photo = PHOTOS[i]

  return (
    <div className="slide">
      <p className="slide-label">four of my favourites</p>
      <div className="carousel" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <button
          className="carousel-arrow left"
          onClick={() => goPhoto(-1)}
          disabled={i === 0}
          aria-label="Previous photo"
        >
          ‹
        </button>

        <figure className="photo-card" key={i}>
          <PhotoFrame src={photo.src} />
          <figcaption>{photo.caption}</figcaption>
        </figure>

        <button
          className="carousel-arrow right"
          onClick={() => goPhoto(1)}
          disabled={i === PHOTOS.length - 1}
          aria-label="Next photo"
        >
          ›
        </button>
      </div>
      <div className="carousel-dots">
        {PHOTOS.map((_, j) => (
          <span
            key={j}
            className={`dot ${j === i ? 'active' : ''}`}
            onClick={() => setI(j)}
          />
        ))}
      </div>
    </div>
  )
}

function QuotesSlide() {
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')

  useEffect(() => {
    setTyped('')
    const text = QUOTES[index]
    let i = 0
    const typeId = setInterval(() => {
      i += 1
      setTyped(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(typeId)
      }
    }, 22)
    return () => clearInterval(typeId)
  }, [index])

  useEffect(() => {
    const text = QUOTES[index]
    const waitMs = text.length * 22 + 1900
    const next = setTimeout(() => setIndex((v) => (v + 1) % QUOTES.length), waitMs)
    return () => clearTimeout(next)
  }, [index])

  return (
    <div className="slide">
      <div className="card quote-card">
        <p className="quote-text">
          {typed}
          {typed.length < QUOTES[index].length && <span className="caret" />}
        </p>
        <div className="dots">
          {QUOTES.map((_, j) => (
            <span key={j} className={`dot ${j === index ? 'active' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

function SongSlide() {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [missing, setMissing] = useState(false)

  const toggle = () => {
    const a = audioRef.current
    if (!a) return
    if (playing) {
      a.pause()
    } else {
      a.play().catch(() => setMissing(true))
    }
    setPlaying(!playing)
  }

  const [coverFailed, setCoverFailed] = useState(false)

  return (
    <div className="slide">
      <div className="card song-card">
        <p className="song-intro">A song for you </p>
        <p className="song-intro tanglish">Nee yepolam low ah ,lonely ah feel pandriyo,remember that you have me and imagine i sing this song for you, en voice konjam nala irukathu than adjust karoo 😅🎶 </p>

        <div className={`turntable ${playing ? 'is-playing' : ''}`}>
          <button
            className={`vinyl ${playing ? 'spinning' : ''}`}
            onClick={toggle}
            aria-label={playing ? 'Pause song' : 'Play song'}
          >
            <span className="vinyl-grooves" />
            <span className="vinyl-shine" />
            <span className="vinyl-label">
              {coverFailed ? (
                <span className="vinyl-note">🧑‍🤝‍🧑</span>
              ) : (
                <img
                  className="vinyl-cover"
                  src="/audio/kannana-kanne.jpg"
                  alt=""
                  onError={() => setCoverFailed(true)}
                />
              )}
            </span>
            <span className="vinyl-spindle" />
          </button>
          <div className="tonearm" aria-hidden="true">
            <span className="tonearm-base" />
            <span className="tonearm-rod" />
            <span className="tonearm-head" />
          </div>
        </div>

        <p className="song-ornament" aria-hidden="true">♡</p>

        <h2 className="song-title">Kannana Kanne</h2>
        <p className="song-lines">
          for you, Sri.
          
          <br />
          Every playlist has one song you skip back to — and this one is yours.
        </p>

        <button className="play-btn" onClick={toggle}>
          {playing ? '⏸ pause' : '▶ play'}
        </button>
        {missing && (
          <p className="missing-note light">
            Add your own copy to <code>public/audio/kannana-kanne.mp3</code> to enable playback.
            (Optional cover image: <code>public/audio/cover.jpg</code>.)
          </p>
        )}
        <audio
          ref={audioRef}
          src="/audio/kannana-kanne.mp3"
          onEnded={() => setPlaying(false)}
          onError={() => setMissing(true)}
        />
      </div>
    </div>
  )
}

function GiftSlide() {
  const [open, setOpen] = useState(false)
  return (
    <div className="slide hero-slide">
      <p className="slide-label">a little something</p>
      {!open && <p className="hint" style={{ marginBottom: '1.2rem' }}>tap the box</p>}
      <button
        className={`gift-box ${open ? 'open' : ''}`}
        onClick={() => setOpen(true)}
        aria-label="Open gift"
      >
        <span className="gift-lid">🎀</span>
        <span className="gift-body">🎁</span>
      </button>
      <div className={`gift-message ${open ? 'show' : ''}`}>
        <p>No actual box can hold this, so here it is in words instead:</p>
        <p className="gift-highlight">a standing invitation to my support, my time, and my terrible jokes — unwrapped, no occasion needed, forever.</p>
      </div>
    </div>
  )
}

const CLOSING_POEM_LINES = [
  'People come and go,',
  'but some stay long enough',
  'to stop being people you know',
  'and start being home.',
]
const CLOSING_POEM_TEXT = CLOSING_POEM_LINES.join('\n')

function ClosingSlide() {
  const typed = useTypewriter(CLOSING_POEM_TEXT, 26)
  const done = typed.length >= CLOSING_POEM_TEXT.length
  const lines = typed.split('\n')

  return (
    <div className="slide hero-slide">
      <p className="eyebrow">last thing</p>
      <p className="closing-poem">
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
        {!done && <span className="caret" />}
      </p>
      <div className={`closing-rest ${done ? 'show' : ''}`}>
        <h2 className="closing-title">We have each other.</h2>
        <p className="hint">forever bonding, okay? 🐒🩷</p>
        <p className="closing-sign">— yours, Jai</p>
      </div>
    </div>
  )
}

const SLIDES = [
  HeroSlide,
  LetterSlide,
  PromisesSlide,
  GallerySlide,
  QuotesSlide,
  GiftSlide,
  SongSlide,
  ClosingSlide,
]

export default function App() {
  const [index, setIndex] = useState(0)
  const touchX = useRef(null)

  const go = useCallback((dir) => {
    setIndex((v) => Math.min(Math.max(v + dir, 0), SLIDES.length - 1))
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
    touchX.current = null
  }

  const Slide = SLIDES[index]

  return (
    <div className="app" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="hearts-bg" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="floating-heart"
            style={{
              left: `${(i * 33) % 100}%`,
              animationDuration: `${9 + (i % 6)}s`,
              animationDelay: `${i * 0.6}s`,
              fontSize: `${0.9 + (i % 3) * 0.3}rem`,
            }}
          >
            {['💗', '🙈', '🩷', '🐒', '💕', '🙊'][i % 6]}
          </span>
        ))}
      </div>

      <div className="slide-viewport" key={index}>
        <Slide />
      </div>

      <nav className="nav">
        <button
          className="arrow"
          onClick={() => go(-1)}
          disabled={index === 0}
          aria-label="Previous slide"
        >
          ‹
        </button>
        <div className="progress-dots">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`progress-dot ${i === index ? 'active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <button
          className="arrow"
          onClick={() => go(1)}
          disabled={index === SLIDES.length - 1}
          aria-label="Next slide"
        >
          ›
        </button>
      </nav>
    </div>
  )
}
