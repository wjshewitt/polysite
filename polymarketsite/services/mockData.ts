import { Trade, Comment, CryptoPrice, AggOrderbook } from "@/types/polymarket";

// Mock data generator for development and testing
export class MockDataGenerator {
  private intervalIds: NodeJS.Timeout[] = [];
  private isRunning = false;

  private marketTitles = [
    "Will Bitcoin reach $100k in 2024?",
    "Will Trump win the 2024 election?",
    "Will Ethereum hit $5k in 2024?",
    "Will the Fed cut rates in Q1 2024?",
    "Will Apple stock reach $200?",
    "Will AI replace 50% of jobs by 2025?",
    "Will Twitter rebrand succeed?",
    "Will SpaceX land on Mars by 2026?",
    "Will inflation drop below 2% in 2024?",
    "Will Tesla produce 2M cars in 2024?",
  ];

  private outcomes = [
    "Yes",
    "No",
    "Likely",
    "Unlikely",
    "Very Likely",
    "Very Unlikely",
  ];

  private usernames = [
    "crypto_trader",
    "market_guru",
    "whale_watcher",
    "degen_king",
    "prediction_pro",
    "stats_analyst",
    "momentum_trader",
    "value_hunter",
    "alpha_seeker",
    "risk_master",
  ];

  private comments = [
    "This market is heating up! 🔥",
    "Strong bullish momentum here",
    "Expecting a reversal soon",
    "Volume looking interesting",
    "Market makers are accumulating",
    "Technical indicators looking good",
    "Fundamentals support this outcome",
    "Great entry point right now",
    "Risk/reward looks favorable",
    "Historical data suggests yes",
    "Too much uncertainty still",
    "Waiting for more data",
    "Smart money is on the other side",
    "This could go either way",
    "Underpriced in my opinion",
  ];

  private generateRandomId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private randomPrice(): number {
    return Math.random() * 0.9 + 0.05; // Between 0.05 and 0.95
  }

  private randomSize(): number {
    return Math.floor(Math.random() * 10000) + 100;
  }

  public generateTrade(): Trade {
    const marketTitle = this.randomChoice(this.marketTitles);
    const marketId = this.generateRandomId();
    const side = Math.random() > 0.5 ? "BUY" : "SELL";
    const price = this.randomPrice();
    const size = this.randomSize();

    return {
      id: this.generateRandomId(),
      market: marketId,
      marketTitle,
      asset: this.generateRandomId(),
      side,
      size: size.toString(),
      price: price.toFixed(4),
      timestamp: Date.now(),
      maker: `0x${this.generateRandomId()}`,
      taker: `0x${this.generateRandomId()}`,
      tradeId: this.generateRandomId(),
      outcome: this.randomChoice(this.outcomes),
      outcomeIndex: Math.floor(Math.random() * 2),
      feeRateBps: "100",
      status: "matched",
    };
  }

  public generateComment(): Comment {
    return {
      id: this.generateRandomId(),
      marketId: this.generateRandomId(),
      userId: this.generateRandomId(),
      username: this.randomChoice(this.usernames),
      content: this.randomChoice(this.comments),
      timestamp: Date.now(),
      likes: Math.floor(Math.random() * 50),
      dislikes: Math.floor(Math.random() * 10),
    };
  }

  public generateCryptoPrice(symbol: string): CryptoPrice {
    // More realistic current prices (as of 2024)
    const basePrices: Record<string, number> = {
      BTCUSDT: 43500,
      ETHUSDT: 2280,
      SOLUSDT: 98,
      XRPUSDT: 0.52,
      ADAUSDT: 0.48,
      DOGEUSDT: 0.082,
      MATICUSDT: 0.67,
      AVAXUSDT: 34.2,
      DOTUSDT: 6.15,
      LINKUSDT: 14.8,
      "MATIC-USD": 0.67,
      "ETH-USD": 2280,
      "USDC-USD": 1.0,
    };

    const basePrice = basePrices[symbol] || 1000;

    // Smaller, more realistic price variations (±0.5%)
    const variation = (Math.random() - 0.5) * basePrice * 0.01;
    const price = basePrice + variation;

    // More realistic 24h changes (±5%)
    const change24h = (Math.random() - 0.5) * 0.1; // -5% to +5%

    // Realistic volume based on market cap
    const volumeMultiplier: Record<string, number> = {
      BTCUSDT: 25000000000, // $25B daily volume
      ETHUSDT: 12000000000, // $12B daily volume
      SOLUSDT: 2500000000, // $2.5B daily volume
      XRPUSDT: 1500000000,
      ADAUSDT: 400000000,
      DOGEUSDT: 600000000,
      MATICUSDT: 350000000,
      AVAXUSDT: 450000000,
      DOTUSDT: 200000000,
      LINKUSDT: 300000000,
    };

    const baseVolume = volumeMultiplier[symbol] || 100000000;
    const volume24h = baseVolume * (0.8 + Math.random() * 0.4); // ±20% variation

    // Market cap estimates
    const marketCapMultiplier: Record<string, number> = {
      BTCUSDT: 850000000000, // $850B
      ETHUSDT: 275000000000, // $275B
      SOLUSDT: 42000000000, // $42B
      XRPUSDT: 28000000000, // $28B
      ADAUSDT: 17000000000, // $17B
      DOGEUSDT: 12000000000, // $12B
      MATICUSDT: 6500000000, // $6.5B
      AVAXUSDT: 13000000000, // $13B
      DOTUSDT: 8000000000, // $8B
      LINKUSDT: 8500000000, // $8.5B
    };

    const marketCap = marketCapMultiplier[symbol] || 1000000000;

    return {
      symbol,
      price: price.toFixed(price >= 1 ? 2 : price >= 0.01 ? 4 : 6),
      change24h: change24h.toFixed(4),
      volume24h: volume24h.toFixed(0),
      marketCap: marketCap.toFixed(0),
      timestamp: Date.now(),
    };
  }

  public generateOrderbook(): AggOrderbook {
    const marketId = this.generateRandomId();
    const numLevels = 15;

    const bids = Array.from({ length: numLevels }, (_, i) => {
      const price = 0.5 - i * 0.02;
      const size = Math.random() * 5000 + 500;
      return {
        price: price.toFixed(4),
        size: size.toFixed(2),
      };
    });

    const asks = Array.from({ length: numLevels }, (_, i) => {
      const price = 0.5 + i * 0.02;
      const size = Math.random() * 5000 + 500;
      return {
        price: price.toFixed(4),
        size: size.toFixed(2),
      };
    });

    return {
      market: marketId,
      asset: this.generateRandomId(),
      timestamp: Date.now(),
      bids,
      asks,
    };
  }

  public start(
    onTrade: (trade: Trade) => void,
    onComment: (comment: Comment) => void,
    onCryptoPrice: (price: CryptoPrice) => void,
    onOrderbook: (orderbook: AggOrderbook) => void,
  ) {
    if (this.isRunning) {
      console.warn("Mock data generator is already running");
      return;
    }

    this.isRunning = true;
    console.log("🎭 Starting mock data generator...");

    // Generate trades every 2-5 seconds
    const tradeInterval = setInterval(
      () => {
        onTrade(this.generateTrade());
      },
      Math.random() * 3000 + 2000,
    );

    // Generate comments every 5-10 seconds
    const commentInterval = setInterval(
      () => {
        onComment(this.generateComment());
      },
      Math.random() * 5000 + 5000,
    );

    // Update crypto prices every 3 seconds
    const cryptoInterval = setInterval(() => {
      [
        "BTCUSDT",
        "ETHUSDT",
        "SOLUSDT",
        "XRPUSDT",
        "ADAUSDT",
        "DOGEUSDT",
        "MATICUSDT",
        "AVAXUSDT",
        "DOTUSDT",
        "LINKUSDT",
      ].forEach((symbol) => {
        onCryptoPrice(this.generateCryptoPrice(symbol));
      });
    }, 3000);

    // Update orderbook every 5 seconds
    const orderbookInterval = setInterval(() => {
      onOrderbook(this.generateOrderbook());
    }, 5000);

    this.intervalIds = [
      tradeInterval,
      commentInterval,
      cryptoInterval,
      orderbookInterval,
    ];

    // Generate initial data
    onTrade(this.generateTrade());
    onComment(this.generateComment());
    [
      "BTCUSDT",
      "ETHUSDT",
      "SOLUSDT",
      "XRPUSDT",
      "ADAUSDT",
      "DOGEUSDT",
      "MATICUSDT",
      "AVAXUSDT",
      "DOTUSDT",
      "LINKUSDT",
    ].forEach((symbol) => {
      onCryptoPrice(this.generateCryptoPrice(symbol));
    });
    onOrderbook(this.generateOrderbook());

    console.log("✅ Mock data generator started");
  }

  public stop() {
    if (!this.isRunning) {
      return;
    }

    this.intervalIds.forEach((id) => clearInterval(id));
    this.intervalIds = [];
    this.isRunning = false;
    console.log("🛑 Mock data generator stopped");
  }

  public isGenerating(): boolean {
    return this.isRunning;
  }
}

export const mockDataGenerator = new MockDataGenerator();
