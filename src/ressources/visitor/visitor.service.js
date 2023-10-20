const Visitor = require("./visitor.model");
const HttpException = require("../../utils/exceptions/http.exception");
const { dbConnect } = require("../../config/dbConnect");

dbConnect();

const ERROR_MESSAGES = {
  CREATION_ERROR: 'Erreur de donnée',
};

class VisitorService {
  Visitor = Visitor;
  
  async getAll(req, res, next){
    const session = "user"

    if (session) {
      try {
        const year = new Date().getUTCFullYear();
  
        const visitorsPerMonth = await Visitor.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(year, 0, 1), // Date de début de l'année en cours
                $lt: new Date(year + 1, 0, 1), // Date de début de l'année suivante
              },
              sellerId: session.user.id,
            },
          },
          {
            $group: {
              _id: {
                month: { $month: '$createdAt' },
              },
              count: { $sum: 1 },
            },
          },
          {
            $sort: {
              '_id.month': 1, // Triez les résultats par mois dans l'ordre croissant (de janvier à décembre)
            },
          },
        ]);
  
        const moisAbreges = visitorsPerMonth.map((visite) => {
          const mois = new Date(year, visite._id.month - 1, 1).toLocaleString(
            'default',
            {
              month: 'short',
            }
          );
          return mois.substring(0, 3);
        });
  
        const currentDate = new Date(); // Date en cours
        currentDate.setUTCHours(0, 0, 0, 0);
  
        // const previousDayEnd = new Date(currentDate);
        // previousDayEnd.setUTCDate(previousDayEnd.getDate() - 1); // Date du jour précédent
  
        // const previousDayStart = new Date(previousDayEnd);
        // previousDayStart.setUTCDate(previousDayStart.getDate() - 1); // Date du jour précédent du jour précédent
        const previousDayEnd = new Date(currentDate);
        previousDayEnd.setUTCDate(previousDayEnd.getDate() - 1); // Date du jour précédent
  
        const previousDayStart = new Date(previousDayEnd);
        previousDayStart.setUTCDate(previousDayStart.getDate() - 1); // Date du jour précédent du jour précédent
  
        const currentDayVisitors = await Visitor.countDocuments({
          createdAt: {
            $gte: previousDayEnd,
            $lt: currentDate,
          },
          sellerId: session.user.id,
        });
  
        const previousDayVisitors = await Visitor.countDocuments({
          createdAt: {
            $gte: previousDayStart,
            $lt: previousDayEnd,
          },
          sellerId: session.user.id,
        });
  
        const differencePercentage = (
          ((currentDayVisitors - previousDayVisitors) / previousDayVisitors) *
          100
        ).toFixed(2);
  
        let status = '';
        if (differencePercentage > 0) {
          status = 'augmentation';
        } else if (differencePercentage < 0) {
          status = 'baisse';
        } else {
          status = 'stable';
        }
  
        const visitorsPerM = visitorsPerMonth.map((item) => item.count);
  
        const stat = {
          moisAbreges,
          currentDayVisitors,
          previousDayVisitors,
          differencePercentage,
          status,
          visitorsPerM,
        };
  
        return new Response(JSON.stringify(stat), {
          status: 200,
        });
      } catch (error) {
        console.log('erreur', error);
        return new Response('Internal Server Error', { status: 500 });
      }
    }
  }
}


module.exports = VisitorService;
