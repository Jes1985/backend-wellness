const User = require("./user.model");
const HttpException = require("../../utils/exceptions/http.exception");
const { dbConnect } = require("../../config/dbConnect");

dbConnect();

const ERROR_MESSAGES = {
  CREATION_ERROR: 'Erreur de donnée',
};

class UserService {
  User = User;
  
  async create(req, res, next) {
    const session = "user";

    if (session) {
      const { profil, bio, banner } = await req.json();
      try {
        const profile = new Profil({
          user: session.user.id,
          profil,
          bio,
          banner,
        });
  
        await profile.save();
        return new Response(JSON.stringify(profile), { status: 201 });
      } catch (error) {
        return new Response('Erreur de creation de service', { status: 500 });
      }
    } else {
      return new Response(
        'Vous devez vous connecter pour effectuer cette action',
        { status: 401 }
      );
    }
  }

  async getAll(req, res, next) {
    const session = "user";

    if (!session) {
      return NextResponse.json({
        message: 'Vous devez vous connecter pour effectuer cette action',
      });
    }
  
    try {
      const profil = await Profil.findOne({ user: session.user.id });
      return new Response(JSON.stringify(profil), { status: 200 });
    } catch (error) {
      console.log(error);
      return new Response('Erreur de profil', { status: 500 });
    }
  }

  async update(req, res, next) {
    const session = "user";

    if (!session) {
      return NextResponse.json({
        message: 'Vous devez vous connecter pour effectuer cette action',
      });
    }
    const { profil, bio, banner } = await req.json();
    try {
      const profile = await Profil.findOneAndUpdate({
        user: session.user.id,
        $set: {
          profil: profil,
          bio: bio,
          banner: banner,
        },
  
        new: true,
      });
      return new Response(JSON.stringify(profile), { status: 200 });
    } catch (error) {
      console.log(error);
      return new Response('Erreur de profil', { status: 500 });
    }
  }
}


module.exports = UserService;
