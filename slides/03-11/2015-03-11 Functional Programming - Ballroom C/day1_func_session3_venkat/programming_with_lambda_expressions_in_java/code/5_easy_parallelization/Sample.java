import java.util.*;
import java.util.stream.Stream;

public class Sample {
  public static void findStockImperative(List<String> symbols) {
    long start = System.nanoTime();
    List<StockInfo> stockPrices = new ArrayList<>();
    
    for(String ticker : symbols) {
      stockPrices.add(StockUtil.getPrice(ticker));
    }

    List<StockInfo> stocksLessThan500 = new ArrayList<>();
    for(StockInfo stockInfo : stockPrices) {
      if(StockUtil.isPriceLessThan(500).test(stockInfo))
        stocksLessThan500.add(stockInfo);
    }
    
    StockInfo highPriced = new StockInfo("", 0.0);
    for(StockInfo stockInfo : stocksLessThan500) {
      highPriced = StockUtil.pickHigh(highPriced, stockInfo);
    }
    
    long end = System.nanoTime();
    System.out.println(highPriced);
    System.out.println("Time: " + (end - start)/1.0e9);
  }

  public static void findStockDeclarative(Stream<String> tickers) {
    long start = System.nanoTime();
    StockInfo highPriced = 
      tickers
      .map(StockUtil::getPrice)
      .filter(StockUtil.isPriceLessThan(500))
      .reduce(new StockInfo("", 0.0), StockUtil::pickHigh);
    long end = System.nanoTime();
    
    System.out.println(highPriced);
    System.out.println("Time: " + (end - start)/1.0e9);
  }
  
  public static void main(String[] args) {
    List<String> symbols = Tickers.symbols;    

    findStockImperative(symbols);
    findStockDeclarative(symbols.stream());
    findStockDeclarative(symbols.parallelStream());    
  }
}

