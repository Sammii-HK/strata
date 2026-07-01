import WidgetKit
import SwiftUI

// MARK: - Content (mirrors src/facts.ts; inline so the widget is fully offline)

struct Fact {
  let map: String
  let headline: String
  let detail: String
}

enum FactStore {
  static let all: [Fact] = [
    Fact(map: "Cosmos", headline: "The ISS is 8 light-milliseconds away", detail: "It orbits about 400 km up, so close Strata zooms past it before the Moon appears."),
    Fact(map: "Cosmos", headline: "Proxima Centauri is 4.24 light-years away", detail: "The nearest star to the Sun, yet still 270,000 times farther than the Sun itself."),
    Fact(map: "Cosmos", headline: "The Milky Way is 100,000 light-years across", detail: "Light that left the far side when our ancestors were flint-knapping is only arriving now."),
    Fact(map: "Cosmos", headline: "Andromeda is 2.5 million light-years away", detail: "The farthest thing you can see with the naked eye, and it is coming towards us."),
    Fact(map: "Cosmos", headline: "The observable universe is 93 billion light-years wide", detail: "Bigger than its age in light-years, because space itself has been stretching."),
    Fact(map: "Cosmos", headline: "A constellation is an illusion of depth", detail: "The stars of Orion look like a group, but some are hundreds of light-years farther than others."),
    Fact(map: "Cosmos", headline: "You always see the Sun 8 minutes in the past", detail: "That is how long its light takes to reach us. It is never quite where it looks."),
    Fact(map: "History", headline: "The Great Pyramid was built around 2560 BC", detail: "It stood for over 3,800 years as the tallest structure humans had ever made."),
    Fact(map: "History", headline: "Gutenberg printed his Bible around 1455", detail: "Within 50 years, printed books outnumbered every manuscript copied in the previous thousand."),
    Fact(map: "History", headline: "The Moon landing was closer to the Wright brothers than to today", detail: "1903 to 1969 to now: powered flight to the Moon in a single lifetime."),
    Fact(map: "History", headline: "Penicillin was discovered by accident in 1928", detail: "A stray mould on a forgotten dish, and infections stopped being a death sentence."),
    Fact(map: "History", headline: "Cleopatra lived closer to the Moon landing than to the Pyramids", detail: "The Great Pyramid was already 2,500 years old in her lifetime."),
    Fact(map: "History", headline: "The T. rex is closer to us than to the Stegosaurus", detail: "More time separates those two dinosaurs than separates T. rex from you."),
    Fact(map: "History", headline: "Oxford University is older than the Aztec Empire", detail: "Teaching began at Oxford around 1096; Tenochtitlan was founded in 1325."),
    Fact(map: "History", headline: "Woolly mammoths still roamed when the Pyramids were built", detail: "A small population survived on Wrangel Island until about 2000 BC."),
    Fact(map: "History", headline: "Darwin and germ theory arrived the same decade", detail: "On the Origin of Species (1859) and the germ theory of disease reshaped life at once."),
  ]

  static func ofTheDay(_ date: Date) -> Fact {
    let day = Calendar.current.ordinality(of: .day, in: .era, for: date) ?? 0
    return all[abs(day) % all.count]
  }
}

// MARK: - Timeline

struct FactEntry: TimelineEntry {
  let date: Date
  let fact: Fact
}

struct Provider: TimelineProvider {
  func placeholder(in context: Context) -> FactEntry { FactEntry(date: Date(), fact: FactStore.all[0]) }
  func getSnapshot(in context: Context, completion: @escaping (FactEntry) -> Void) {
    completion(FactEntry(date: Date(), fact: FactStore.ofTheDay(Date())))
  }
  func getTimeline(in context: Context, completion: @escaping (Timeline<FactEntry>) -> Void) {
    let now = Date()
    let entry = FactEntry(date: now, fact: FactStore.ofTheDay(now))
    let tomorrow = Calendar.current.startOfDay(for: Calendar.current.date(byAdding: .day, value: 1, to: now) ?? now)
    completion(Timeline(entries: [entry], policy: .after(tomorrow)))
  }
}

// MARK: - View

extension Color {
  init(strataHex hex: String) {
    let v = UInt64(hex, radix: 16) ?? 0
    self = Color(.sRGB, red: Double((v >> 16) & 0xff) / 255, green: Double((v >> 8) & 0xff) / 255, blue: Double(v & 0xff) / 255, opacity: 1)
  }
}

struct StrataWidgetView: View {
  var entry: FactEntry
  var body: some View {
    VStack(alignment: .leading, spacing: 6) {
      HStack {
        Text("STRATA").font(.system(size: 10, weight: .heavy)).kerning(1.6).foregroundColor(Color(strataHex: "e8b84b"))
        Spacer()
        Text(entry.fact.map.uppercased()).font(.system(size: 9, weight: .semibold)).foregroundColor(Color(white: 0.5))
      }
      Text(entry.fact.headline).font(.system(size: 15, weight: .bold)).foregroundColor(.white).minimumScaleFactor(0.85).lineLimit(4)
      Text(entry.fact.detail).font(.system(size: 11)).foregroundColor(Color(white: 0.68)).lineLimit(3)
      Spacer(minLength: 0)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    .containerBackground(for: .widget) { Color(strataHex: "101218") }
  }
}

@main
struct StrataWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "StrataWidget", provider: Provider()) { entry in
      StrataWidgetView(entry: entry)
    }
    .configurationDisplayName("Strata: fact of the day")
    .description("A striking fact from the scale of the universe and history.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}
